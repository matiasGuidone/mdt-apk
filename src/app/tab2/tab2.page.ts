import { Component } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { ComunicacionService } from '../servicios/comunicacion.service';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page  {
  public movimientos : Array<any> = new Array(); 
  personal: any;

  ionViewWillEnter() {
    this.storage.get("personal").then((pers) => {
      if(pers != null){
        this.personal = JSON.parse(pers);
      }
    });
    this.storage.get("movimientos").then((movs) => {
    if(movs != null){
      this.movimientos = JSON.parse(movs).reverse();
       
    }
    else{

    }
    });
  }
  constructor(public alertController: AlertController, private servicio: ComunicacionService, private storage : Storage) {
    
    
  }
  getNombre(id){
    if (id == this.personal.id ){
      return this.personal.nombre+" "+this.personal.apellido;
    }
  }

  getmovimiento(tipo: string) {
    if(tipo == "I"){
      return "Ingreso";
    }
    else if (tipo == "E"){
      return "Egreso"
    }
    else return "";
  }
  enviarMovs(){
    this.servicio.envioMovimientos();
  }

  eliminar(i){
    if(i == "todos"){
      let arraux = new Array();
      for(let i = 0; i < this.movimientos.length; i++){
        if(this.movimientos[i].estado != 2){
          arraux.push(this.movimientos[i]);
        }
      }
      this.movimientos = arraux;
      this.storage.set("movimientos", JSON.stringify(this.movimientos.reverse())).then(()=>{
        this.ionViewWillEnter();
      }); 
    }
    else{
    this.movimientos.splice(i, 1);
        this.storage.set("movimientos", JSON.stringify(this.movimientos.reverse())).then(()=>{
          this.ionViewWillEnter();
        }); 
      } 
    }
    

}
