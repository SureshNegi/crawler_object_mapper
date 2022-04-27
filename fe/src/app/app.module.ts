import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppComponent } from './app.component';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatListModule } from '@angular/material/list';
import { HttpClientModule } from '@angular/common/http';
import { MatInputModule } from '@angular/material/input';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { RegisterAppComponent } from './admin/register-app/register-app.component';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';
import { RouterModule } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard/dashboard.component';
import { CommonModule } from '@angular/common';
@NgModule({
  declarations: [AppComponent, RegisterAppComponent, DashboardComponent],
  imports: [
    RouterModule,
    CommonModule,
    MatProgressSpinnerModule,
    MatGridListModule,
    MatCardModule,
    MatButtonModule,
    BrowserModule,
    MatExpansionModule,
    BrowserAnimationsModule,
    HttpClientModule,
    MatListModule,
    MatInputModule,
    MatTabsModule,
    MatSelectModule,
    RouterModule.forRoot(
      [
        { path: 'home', component: DashboardComponent },
        { path: 'admin', component: RegisterAppComponent },
      ],
      { useHash: true }
    ),
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
