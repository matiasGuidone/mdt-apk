import { Component } from '@angular/core';
import { QRScanner, QRScannerStatus } from '@ionic-native/qr-scanner/ngx';
import { IonRouterOutlet, ModalController, Platform, ToastController } from '@ionic/angular';
import { AlertController } from '@ionic/angular';
import { DatePipe } from "@angular/common";
import { Storage } from '@ionic/storage'; 
import { ComunicacionService } from '../servicios/comunicacion.service';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.css']
})
export class Tab1Page {

  public usuario = "Matias";
  public selectedIndex = 0;
  isOn = false;
  encodedData = '';
  public QRSCANNED_DATA: string;
  escaneo = '';
  public disbtn = 'display : none';
  public btnmark: string = "display:block";
  nombreape: string;
  moviactual:any;

  constructor(private routerOutlet: IonRouterOutlet, private servicio :ComunicacionService,private storage: Storage, private qrScanCtrl: QRScanner, private platform: Platform, public alertController: AlertController, private modalController: ModalController, public toastController: ToastController, private datePipe: DatePipe) {
    this.platform.backButton.subscribeWithPriority(10, () => {
      this.closeScanner();
    });
  }

  closeScanner() {
    this.isOn = false;
    this.qrScanCtrl.hide();
    this.qrScanCtrl.destroy();
    this.disbtn = 'display : none';
    this.btnmark = 'display : block;';
  }

  async InpObservaciones() {
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: 'Prompt!',
      inputs: [
        {
          name: 'Observaciones',
          type: 'text',
          placeholder: 'Describa eventualidades'
        } 
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            console.log('Confirm Cancel');
          }
        }, {
          text: 'Aceptar',
          handler: () => {
            console.log('Confirm Ok');
          }
        }
      ]
    });

    await alert.present();
  }

  escanear() {
    // Optionally request the permission early
    this.qrScanCtrl.prepare()
      .then((status: QRScannerStatus) => {
        if (status.authorized) {
          console.log('qrscaner authorized');
          // camera permission was granted
          // start scanning
          const scanSub = this.qrScanCtrl.scan().subscribe((text: Object) => {
            // alert(text);
            //this.location.back(); // go to previous page
            let code = this.generacode();
            if (text == code ) {
              //comprobar horario del usuario
              //comprobar horario del usuario para saber si es ingreso o egreso
              //
              this.storage.get('personal').then((pers) => {
                if (pers != null) {
                  let personal = JSON.parse(pers);
                  this.nombreape = personal.nombre + ", " + personal.apellido;
                  //this.nrosocio = personal.nrosocio;
                  this.storage.get('movimientos').then((movs) => {
                    if(movs == null){
                      let tipo = "";
                      movs = new Array();
                      let dia = new Date();
                      let horam :number = +this.datePipe.transform(dia, "HH");
                      if ((+(personal.horaentradamat.split(":")[0])-1) <= horam && (+(personal.horaentradamat.split(":")[0])+1) >= horam ){
                          tipo = "I";
                      }
                      if ((+(personal.horasalidamat.split(":")[0])-1) <= horam && (+(personal.horasalidamat.split(":")[0])+1) >= horam ){
                            tipo = "E";
                      }
                      if ((+(personal.horaentradaves.split(":")[0])-1) <= horam && (+(personal.horaentradaves.split(":")[0])+1) >= horam ){
                          tipo = "I";
                      }
                      if ((+(personal.horasalidaves.split(":")[0])-1) <= horam && (+(personal.horasalidaves.split(":")[0])+1) >= horam ){
                        tipo = "E";
                      }
                      else{ tipo = "I"; }
                      movs.push({"fechahora" : dia, "tipo": tipo, "id" : personal.id, "estado" : 1});

                 
                      this.storage.set('movimientos', JSON.stringify(movs)).then(d => this.servicio.envioMovimientos());
                     
                      this.createModal(tipo, this.datePipe.transform(dia, "HH:mm:ss dd/MM/yyyy")).then((data) => {
                        this.closeScanner(); 
                      });
                      //rlm_fechahora 	rlm_tipo 	rlm_observaciones 	per_id 	
                    }
                    else{
                      let tipo = "";
                      movs = JSON.parse(movs);
                      let dia = new Date();
                      let horam :number = +this.datePipe.transform(dia, "HH");
                      if ((+(personal.horaentradamat.split(":")[0])-1) <= horam && (+(personal.horaentradamat.split(":")[0])+1) >= horam ){
                          tipo = "I";
                      }
                      else if ((+(personal.horasalidamat.split(":")[0])-1) <= horam && (+(personal.horasalidamat.split(":")[0])+1) >= horam ){
                            tipo = "E";
                      }
                      else if ((+(personal.horaentradaves.split(":")[0])-1) <= horam && (+(personal.horaentradaves.split(":")[0])+1) >= horam ){
                          tipo = "I";
                      }
                      else if ((+(personal.horasalidaves.split(":")[0])-1) <= horam && (+(personal.horasalidaves.split(":")[0])+1) >= horam ){
                        tipo = "E";
                      }
                      else{ 
                        if(movs[movs.length-1].tipo == "I"){
                          tipo = "E"
                        }
                        else  if(movs[movs.length-1].tipo == "E"){
                          tipo = "I"
                        }
                       }
                      movs.push({"fechahora" : dia, "tipo": tipo, "id" : personal.id, "estado" : 1});
                      // this.servicio.sinsubir  = 0;
                      // for(let n of movs){
                      //   if(n.estado ==1){
                      //     this.servicio.sinsubir++;
                      //   } 
                      // }
                      
                      this.storage.set('movimientos', JSON.stringify(movs)).then(d => this.servicio.envioMovimientos());
                      let clase = "alert-ingreso";
                      if(tipo =="I"){clase = "alert-ingreso";}
                      else if(tipo == "E"){clase = "alert-egreso";}
                      this.createModal(tipo, this.datePipe.transform(dia, "HH:mm:ss dd/MM/yyyy")).then((data) => {
                        this.closeScanner(); 
                      });

                    }
                    // this.servicio.envioMovimientos();
          
                  });
            }
          });
            }
            else { this.presentAlert('Código erróneo '+text+", "+ code ).then((data) => {
              this.closeScanner(); 
            });   }
            //this.qrScanCtrl.hide(); // hide camera preview
            //scanSub.unsubscribe(); // stop scanning
          });

          this.qrScanCtrl.resumePreview();

          // show camera preview
          this.qrScanCtrl.show().then((data: QRScannerStatus) => {
            
            //alert('scaner show' + data.showing);
            //document.getElementsByTagName('video')[0].style.zIndex = '2'; 
            this.disbtn = 'display : block;';
            this.btnmark = 'display : none;';
          }, err => {
            this.presentAlert(err).then((data) => {
              this.closeScanner(); 
            });
          });
          // wait for user to scan something, then the observable callback will be called
        } else if (status.denied) {
          // camera permission was permanently denied
          // you must use QRScanner.openSettings() method to guide the user to the settings page
          // then they can grant the permission from there
          if (!status.authorized && status.canOpenSettings) {
            if (confirm('Permitir acceso a camara para leer códigos qr')) {
              this.qrScanCtrl.openSettings();
            }
          }
        } else {
          // permission was denied, but not permanently. You can ask for permission again at a later time.
        }
      })
      .catch((e: any) => console.log('Error is', e));
  }
  gettipo(tipo: string) {
    if(tipo == "I"){
      return "Ingreso";
    }
    else if (tipo == "E"){
      return "Egreso"
    }
    else return "";
  }

  generacode():string {
    let dia = new Date();
    let cod = "";
    let d = +this.datePipe.transform(dia, "dd");
    let m = +this.datePipe.transform(dia, "MM");
    let a = +this.datePipe.transform(dia, "yyyy");
    cod = this.datePipe.transform(dia, "yyyyMMdd");
    cod += (d+m+a).toString();
    cod += (a-m-d).toString();
    cod += (a*m*d).toString();
    return "MUTUAL"+cod;
  }

  async presentAlert(mensaje, css = 'my-custom-class') {
    const alert = await this.alertController.create({
      cssClass: css,
      header: 'Marcador',
      subHeader: '',
      message: mensaje,
      buttons: ['Aceptar']
    });

    await alert.present();
  }

  async createModal(t, h) {
    
    let color ;
    if(t =="I"){color = "success"; }
    else if(t == "E"){ color = "primary"; }
      const toast = await this.alertController.create({
        header: this.nombreape,
        message: this.gettipo(t)+", hora: "+h,
        //position: 'middle',
        //color:color,
        //duration: 5000,
        buttons: [
         
           {
            text: 'Aceptar',
            role: 'cancel',
            handler: () => {
              
            }
          }
        ],
      });
      toast.present();
   
  }

  marcarmovimiento(){
    //this.nrosocio = personal.nrosocio;
    this.storage.get('movimientos').then((movs) => {
      if(movs == null){

      }
       else{

       }
      
      });
  }
  testmarcado(){
    this.storage.get('personal').then((pers) => {
      if (pers != null) {
        let personal = JSON.parse(pers);
        this.nombreape = personal.nombre + ", " + personal.apellido;
        //this.nrosocio = personal.nrosocio;
        // this.storage.get('movimientos').then((movs) => {
        //   if(movs == null){
            let tipo = "";
            // movs = new Array();
            let dia = new Date();
            let horam :number = +this.datePipe.transform(dia, "HH");
            if ((+(personal.horaentradamat.split(":")[0])-1) <= horam && (+(personal.horaentradamat.split(":")[0])+1) >= horam ){
                tipo = "I";
            }
            if ((+(personal.horasalidamat.split(":")[0])-1) <= horam && (+(personal.horasalidamat.split(":")[0])+1) >= horam ){
                  tipo = "E";
            }
            if ((+(personal.horaentradaves.split(":")[0])-1) <= horam && (+(personal.horaentradaves.split(":")[0])+1) >= horam ){
                tipo = "I";
            }
            if ((+(personal.horasalidaves.split(":")[0])-1) <= horam && (+(personal.horasalidaves.split(":")[0])+1) >= horam ){
              tipo = "E";
            }
            else{ tipo = "I"; }
            //movs.push({"fechahora" : dia, "tipo": tipo, "id" : personal.id, "estado" : 1});
            this.moviactual = {"fechahora" : dia, "tipo": tipo, "id" : personal.id, "estado" : 1};

                  //  this.servicio.sinsubir  = 0;
                  //     for(let n of movs){
                  //       if(n.estado ==1){
                  //         this.servicio.sinsubir++;
                  //       } 
                  //     }

            //this.storage.set('movimientos', JSON.stringify(movs)).then(d => this.servicio.envioMovimientos());
           
            this.createModal(tipo, this.datePipe.transform(dia, "HH:mm:ss dd/MM/yyyy")).then((data) => {
              this.closeScanner(); 
            });

            //rlm_fechahora 	rlm_tipo 	rlm_observaciones 	per_id 	
            
          // }
          // else{
          //   let tipo = "";
          //   movs = JSON.parse(movs);
          //   let dia = new Date();
          //   let horam :number = +this.datePipe.transform(dia, "HH");
          //   if ((+(personal.horaentradamat.split(":")[0])-1) <= horam && (+(personal.horaentradamat.split(":")[0])+1) >= horam ){
          //       tipo = "I";
          //   }
          //   else if ((+(personal.horasalidamat.split(":")[0])-1) <= horam && (+(personal.horasalidamat.split(":")[0])+1) >= horam ){
          //         tipo = "E";
          //   }
          //   else if ((+(personal.horaentradaves.split(":")[0])-1) <= horam && (+(personal.horaentradaves.split(":")[0])+1) >= horam ){
          //       tipo = "I";
          //   }
          //   else if ((+(personal.horasalidaves.split(":")[0])-1) <= horam && (+(personal.horasalidaves.split(":")[0])+1) >= horam ){
          //     tipo = "E";
          //   }
          //   else{ 
          //     if(movs[movs.length-1].tipo == "I"){
          //       tipo = "E"
          //     }
          //     else  if(movs[movs.length-1].tipo == "E"){
          //       tipo = "I"
          //     }
          //    }
          //   //movs.push({"fechahora" : dia, "tipo": tipo, "id" : personal.id, "estado" : 1});
          //   this.moviactual = {"fechahora" : dia, "tipo": tipo, "id" : personal.id, "estado" : 1};
            
                      
            //this.storage.set('movimientos', JSON.stringify(movs)).then(d => this.servicio.envioMovimientos());
          //   let clase = "alert-ingreso";
          //   if(tipo =="I"){clase = "alert-ingreso";}
          //   else if(tipo == "E"){clase = "alert-egreso";}
          //   this.createModal(tipo, this.datePipe.transform(dia, "HH:mm:ss dd/MM/yyyy")).then((data) => {
          //     this.closeScanner(); 
          //   }); 

            
          // }
          // this.servicio.envioMovimientos();
        // });
  }
});
  }
}
