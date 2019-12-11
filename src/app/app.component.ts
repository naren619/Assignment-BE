import { Component } from '@angular/core';
import * as $ from 'jquery';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.css']
})

export class AppComponent {
	title = 'Read CSV - Angular';
	filterSearch = "";
	public headerList: any[] = [];			//  initializing for header list
	public recordList: any[] = [];			//  initializing for record list
	public validatedList: any[] = [];			//  initializing for record list

  	fileUploader($event: any) {

		let files = $event.srcElement.files;
		
		// conversion the csv format to JSON format
    if (this.isValidCSVFile(files[0])) {  
      this.loadCSVDatas($event);
    }else if (this.isValidXMLFile(files[0])) { 
      this.loadXMLDatas($event);
    }else{
			alert("Please import valid .csv or .xml file.");
			this.fileReset();

    } 
	}

  loadCSVDatas(event){
    this.headerList = [];		
    this.recordList = []; 
    let input = event.target;
    let reader = new FileReader();
    reader.readAsText(input.files[0]);

    reader.onload = () => {
      let csvData = reader.result;
      let csvRecordsArray = ( < string > csvData).split(/\r\n|\n/);  
      this.headerList = this.getHeaderArray(csvRecordsArray); 
      this.recordList = this.getDataRecordsArray(csvRecordsArray, this.headerList);  
    };

    reader.onerror = function () {
      console.log('error is occured while reading file!');
    };
  }

  loadXMLDatas(event){
    this.validatedList = [];
    let input = event.target;
    let reader = new FileReader();
    reader.readAsText(input.files[0]);
    reader.onload = (data) => {
      parseFile(reader.result);
    };
    //this will parse XML file and output it to website
    var parseFile = (text) => {
      var finalRecords = [];
      var xmlDoc = $.parseXML(text),
        $xml = $(xmlDoc),
        $options = $xml.find("record");
      $.each($options, function (index) {
        let record = [];
        for (var i = 0; i < $(this).children().length; i++) {
          if (index == '0') {
            if (i == 0) {
              record.push($(this)[0].attributes[i].localName);
            }
            record.push($(this).children()[i].localName)
          } else {
            if (i == 0) {
              record.push($(this)[0].attributes[i].value);
            }
            record.push($(this).children()[i].innerHTML);
          }
        } 
        finalRecords.push(record);  
      }); 
       let headerArr = [];
       let recordArr = [];
        for(var i=0;i<finalRecords.length;i++){
          if(i == 0){ 
            headerArr.push(finalRecords[i]);
          }else{
            recordArr.push(finalRecords[i]); 
          }
        }
      this.headerList = [];		
      this.recordList = [];
      this.headerList = headerArr[0];
 
      for (let i = 0; i < recordArr.length; i++) { 
        this.recordList.push({})
        for (let k = 0; k < this.headerList.length; k++) { 
          this.recordList[i][this.headerList[k]] = recordArr[i][k]; 
        }
      } 
    };
  }
  
	// Method to get the dynamic header for the table from csv first row
	getHeaderArray(csvRecordsArr: any) {
		let headers = ( < string > csvRecordsArr[0]).split(',');
		let headerArray = [];
		for (let j = 0; j < headers.length; j++) {
      var str = headers[j];
      var formattedstr;
			if (str.indexOf('"') >= 0) { 
        formattedstr = str.replace(/\"/g, ""); // checks for double quotes which occurs by default in CSV file and removes it.
    	} else {
        formattedstr = str; 
      }
      formattedstr = (formattedstr.charAt(0).toLowerCase() +  formattedstr.slice(1)).replace(/ /g,'');
      headerArray.push(formattedstr); 
		}
		return headerArray;
	}

	// Method to get all the records from csv file ,which will be populated in UI

	getDataRecordsArray(csvRecordsArray: any, headerList: any) {
		let csvArr = [];
		for (let i = 1; i < csvRecordsArray.length; i++) {
			csvArr.push({});
			let curruntRecord = ( < string > csvRecordsArray[i]).split(',');
			for (let k = 0; k < headerList.length; k++) {
				if (curruntRecord[k] != "" && curruntRecord[k] != undefined) {
					if (curruntRecord[k].indexOf('"') >= 0) {
						csvArr[i - 1][headerList[k]] = curruntRecord[k].replace(/\"/g, ""); // checks for double quotes which occurs by default in CSV file and removes it.
					} else {
						csvArr[i - 1][headerList[k]] = curruntRecord[k];
					}
				} 
			} 
		}
		return csvArr;
  } 
  
  // Method to get all the generate the failed transaction results in csv and xml file
  
  generatefailedTransactionReport(){ 
    let referenceNumbers=[];
    this.recordList.forEach((record, index) => { 
      referenceNumbers.push(record['reference']);
    }); 
    var transactionError = this.findTransactionError();
    var duplicateError = this.findDuplicateError(referenceNumbers); 
    this.validatedList = transactionError.concat(duplicateError); 
  }

  findTransactionError(){
    let transaction = [];
    for(var i = 0; i< this.recordList.length; i++){  
      if(this.recordList[i]['startBalance'] != "" && this.recordList[i]['startBalance'] != undefined ){
        var sumValue = parseFloat(this.recordList[i]['startBalance']) + parseFloat(this.recordList[i]['mutation']);
        var roundedsumValue = (Math.round(sumValue * 100) / 100);
  
        if(roundedsumValue != this.recordList[i]['endBalance']){
          transaction.push({ "data" : this.recordList[i], "errorType" : "Transaction Error"}) 
        } 
      } 
    }
    return transaction;
  }

  findDuplicateError(arr){
    let sorted_arr = arr.slice();  
    let results = [];
    let duplicate = [];
    for (let i = 0; i < sorted_arr.length - 1; i++) {
      if (sorted_arr[i + 1] == sorted_arr[i]) {
        results.push(sorted_arr[i]);
      }
    } 
    for(var i = 0; i< this.recordList.length; i++){  
      for(var j = 0; j< results.length; j++){ 
        if(results[j] == this.recordList[i]['reference']){ 
          duplicate.push({ "data" : this.recordList[i], "errorType" : "reference No. duplication"}); 
        }
      }
    }
    return duplicate;
  }

	// Method to check whether file is valid csv or not

	isValidCSVFile(file: any) {
		return file.name.endsWith(".csv");
	} 

  isValidXMLFile(file: any) {
      return file.name.endsWith(".xml");
  }
	fileReset() {
		//this.csvReader.nativeElement.value = "";  
		this.recordList = [];
	}
}