import { HttpClient } from '@angular/common/http';
import {
  Component,
  OnInit,
  ViewEncapsulation,
  ChangeDetectionStrategy,
} from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-register-app',
  templateUrl: './register-app.component.html',
  styleUrls: ['./register-app.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterAppComponent implements OnInit {
  constructor(private httpClient: HttpClient) {}
  public loginValid = true;
  public username = '';
  public password = '';
  _showSpinner: BehaviorSubject<any> = new BehaviorSubject(false);
  ngOnInit(): void {}

  register(form: any) {
    const appName = form['0'].value;
    const appURL = form['1'].value;
    const appPath = form['2'].value;
    this._callAPI({ appName, appURL, appPath }, form);
  }
  private _callAPI(payload: any, form: any) {
    this._showSpinner.next(true);
    this.httpClient
      .post('http://localhost:8081/crawl/applications', payload)
      .subscribe((data: any) => {
        // console.log(data);
        setTimeout(() => {
          this._showSpinner.next(false);
          form.reset();
        }, 1000);
      });
  }
}
