import { RouterModule } from '@angular/router';
import { Routes } from '@angular/router';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component'; 
  
// import { FilterPipe } from './filter.pipe'; 

@NgModule({
  declarations: [
    AppComponent,
   // FilterPipe 
  ],
  imports: [
    BrowserModule,
    RouterModule,
    FormsModule 
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
