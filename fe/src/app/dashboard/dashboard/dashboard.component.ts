import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent {
  mode = 1;
  title = 'client';
  data: any[] = [];
  diffData: any[] = [];
  selectedPage: any;
  selectedApplication: any;
  selectedApplications: any;
  _allPageElementsObjects = [];
  _showSpinner = false;
  _selectedTabIndex = 0;
  _defaultElementToCrawl: any[] = [
    { tag: 'span', title: 'All span elements' },
    { tag: 'input', title: 'All input elements' },
    { tag: 'button', title: 'All button elements' },
    { tag: 'a', title: 'All link elements' },
  ];

  elementNames: any[] = this._defaultElementToCrawl;

  pageNames: any[] = [];
  applications: any[] = [];
  constructor(private httpClient: HttpClient) {}
  ngOnInit() {
    this.getApplications();
  }
  openImage(event: any, element: any) {
    if (element.screenshotName) {
      window.open(`./assets/${element.screenshotName}`, '_blank');
    }
    event.stopPropagation();
    event.preventDefault();
  }
  processURL() {
    this._showSpinner = true;
    this.httpClient
      .get(
        `http://localhost:8081/crawl/application/${this.selectedApplication}`
      )
      .subscribe((data: any) => {
        // console.log(data);
        this._showSpinner = false;
        this.data = data.pageIdentifierList;
        this.diffData = data.pageDifflist;
        this.pageNames = this.data.map((d: any) => {
          return { id: d.pageName, name: d.pageName };
        });
        this.selectedPage = this.pageNames[0].id;
        this._allPageElementsObjects = this.data.find(
          (a) => a.pageName === this.selectedPage
        )?.identifiers;
      });
  }
  selectApplication(data: any) {
    console.log(data);
  }
  selectPage(data: any) {
    this._allPageElementsObjects = this.data.find(
      (a) => a.pageName === this.selectedPage
    )?.identifiers;
  }

  getApplications() {
    this._showSpinner = true;
    this.httpClient
      .get('http://localhost:8081/crawl/applications')
      .subscribe((data: any) => {
        // console.log(data);
        this._showSpinner = false;
        this.applications = data.map((a: any) => {
          return { id: a._id, name: a.appName };
        });
      });
  }
  getDomElementsOfType(name: string) {
    const pageIdentifiers = this.data.find(
      (a) => a.pageName === this.selectedPage
    )?.identifiers;
    return (pageIdentifiers || []).filter(
      (d: any) => d.name === name && d.identifier
    );
  }
  tabChange(args: any) {
    this._allPageElementsObjects.forEach((a: any) => (a.selected = false));
    if (args.index === 1) {
      const pageIdentifiers = this.diffData.find(
        (a) => a.pageName === this.selectedPage
      )?.identifiers;
      const uniqueTags = [
        ...new Set((pageIdentifiers || []).map((d: any) => d.name)),
      ];
      this.elementNames = uniqueTags.map((d: any) => {
        return {
          tag: d,
          title: `All ${d} elements`,
        };
      });
    } else {
      this.elementNames = this._defaultElementToCrawl;
    }
    this._selectedTabIndex = args.index;
  }
  getDiffDomElementsOfType(name: string) {
    console.log(this.diffData);
    const pageIdentifiers = this.diffData.find(
      (a) => a.pageName === this.selectedPage
    )?.identifiers;
    return (pageIdentifiers || []).filter(
      (d: any) => d.name === name && d.identifier
    );
  }
  getDiffTags() {
    const pageIdentifiers = this.diffData.find(
      (a) => a.pageName === this.selectedPage
    )?.identifiers;
    return [
      ...new Set(
        (pageIdentifiers || []).map((d: any) => {
          return {
            tag: d.name,
            title: `All ${d.name} elements`,
          };
        })
      ),
    ];
  }

  onAreaListControlChanged(e: any, list: any, element: any) {
    element.selected = !element.selected;

    this.selectedApplications = this._allPageElementsObjects.filter(
      (i: any) => i.selected
    );
    console.log(this.selectedApplications.length);
  }
  generateJson() {
    const propertyName = 'locator';
    let counter = 0;
    const jsonObj: any = {};
    this.selectedApplications.forEach((element: any) => {
      counter++;
      jsonObj[
        `${element.name}_${
          element.identifierName ? element.identifierName : element.identifier
        }`
      ] = {
        identifier: element.identifier,
        identifierName: element.identifierName,
        type: element.name === 'a' ? 'link' : element.name,
        value: '',
      };
    });
    console.log(jsonObj);
    const c = JSON.stringify(jsonObj);
    const file = new Blob([c], { type: 'text/json' });
    this.download(file, 'fileName.json');
    this._allPageElementsObjects.forEach((a: any) => (a.selected = false));
  }
  download(blob: any, filename: string) {
    var a = document.createElement('a'),
      url = URL.createObjectURL(blob);
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(function () {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }, 0);
  }
  copyAllSelectedItems() {
    if (this.selectedApplications?.length === 0) {
      alert('No records selected!');
      return;
    }
    this.copyToClipboard(
      this.selectedApplications.map((i: any) => i.identifier).join('<br>')
    );
  }
  copyToClipboard(textContent: string) {
    var brRegex = /<brs*[/]?>/gi;
    navigator.clipboard.writeText(textContent.replace(brRegex, '\r\n'));
  }
}
interface CrawlerResponse {
  pageIdentifierList: any[];
  pageDifflist: any[];
}
interface DomElement {
  name: string;
  type: string;
  identifier: string;
  attr: string;
}
