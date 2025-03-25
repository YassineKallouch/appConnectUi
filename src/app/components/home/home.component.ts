import { Component } from '@angular/core';
import { Router } from '@angular/router';


@Component({
  selector: 'app-home',
  imports: [],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {

  constructor(private router: Router) { }

  goTo(appName: string): void {
    this.router.navigateByUrl('/' + appName);
    //this.router.navigateByUrl(`/${appName}`);

  };


}
