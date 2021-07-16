import { Component } from '@angular/core';
import {  Platform } from '@ionic/angular';
import { ComunicacionService } from '../servicios/comunicacion.service';
 

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss']
})
export class TabsPage  {

  constructor(private platform: Platform, private servicio: ComunicacionService) {
    

  }

}
