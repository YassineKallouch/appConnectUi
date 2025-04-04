import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HeaderComponent } from '../header/header.component';


@Component({
  selector: 'app-home',
  imports: [HeaderComponent],
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
