import { AfterViewInit, Component } from '@angular/core';
import { QRScanner, QRScannerStatus } from '@ionic-native/qr-scanner/ngx';
import { IonRouterOutlet, ModalController, Platform, ToastController } from '@ionic/angular';
import { AlertController } from '@ionic/angular';
import { DatePipe } from "@angular/common";
import { Storage } from '@ionic/storage';
import { ComunicacionService } from '../servicios/comunicacion.service';
import { AudioService } from '../servicios/audio.service'; 



@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.css']
})
export class Tab1Page implements AfterViewInit {

  public selectedIndex = 0;
  isOn = false;
  encodedData = '';
  public QRSCANNED_DATA: string;
  escaneo = '';
  public disbtn = 'display : none';
  public btnmark: string = "display:block";
  nombreape: string;
  moviactual: any;
  seleccionar = false; 

  constructor( private audio: AudioService, private routerOutlet: IonRouterOutlet, private servicio: ComunicacionService, private storage: Storage, private qrScanCtrl: QRScanner, private platform: Platform, public alertController: AlertController, private modalController: ModalController, public toastController: ToastController, private datePipe: DatePipe) {
     this.platform.backButton.subscribeWithPriority(10, () => {
       //this.cerrarApp();
        if(this.isOn){
          this.closeScanner();
        }
        else{
          this.cerrarApp().then((data) => {console.log(data)});
        }
       
       
       
    });

    // this.platform.backButton.subscribeWithPriority(-1, () => {
    //   if (!this.routerOutlet.canGoBack()) {
    //     this.cerrarApp().then((data) => {console.log(data)});
    //   }
    // });
     
    this.storage.get('movimientos').then((movs) => { 
      if (movs != null) {
        movs = JSON.parse(movs);
        this.servicio.sinsubir = 0;
        for (let n of movs) {
          if (n.estado == 1) {
            this.servicio.sinsubir++;
          }
        } 
      }
    });
  }

  async cerrarApp() {
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: 'Cerrar',
      message: 'Salir de la aplicación',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {
            console.log('Confirm Cancel: blah');
          }
        }, {
          text: 'Aceptar',
          handler: () => {
            navigator['app'].exitApp();
          }
        }
      ]
    });
    await alert.present();
  }

  ngAfterViewInit(){

    this.audio.preload('marcar', 'assets/audio/marca.mp3');
    this.audio.preload('error', 'assets/audio/error.mp3');

  }


  closeScanner() {
    this.isOn = false;
    this.qrScanCtrl.hide();
    this.qrScanCtrl.destroy();
    this.disbtn = 'display : none';
    this.btnmark = 'display : block;';
  }

  escanear() {
    // Optionally request the permission early
    this.qrScanCtrl.prepare()
      .then((status: QRScannerStatus) => {
        if (status.authorized) {
          console.log('qrscaner authorized');
          // camera permission was granted
          // start scanning
          this.isOn = true;
          const scanSub = this.qrScanCtrl.scan().subscribe((text: Object) => {
            // alert(text);
            //this.location.back(); // go to previous page
            let code = this.generacode();
            this.qrScanCtrl.hide();
            scanSub.unsubscribe();
            if (text == code) {
              this.audio.play('marcar');
              //comprobar horario del usuario
              //comprobar horario del usuario para saber si es ingreso o egreso
              //

              this.storage.get('personal').then((pers) => {
                if (pers != null) {
                  let personal = JSON.parse(pers);
                  this.nombreape = personal.nombre + ", " + personal.apellido;
                  let tipo = "";
                  // movs = new Array();
                  let dia = new Date();
                  let horam: number = +this.datePipe.transform(dia, "HH");
                  console.log(personal);
                  if (personal.horaentradamat == "" && personal.horasalidamat == "" && personal.horaentradaves == "" && personal.horasalidaves == "") {
                    this.seleccionar = true;
                    this.moviactual = { "fechahora": dia, "id": personal.id, "estado": 1 }; this.closeScanner(); return;
                  }
                  else {
                    if (dia.getDay() == 6) {
                      if ((+(personal.horaentradasab.split(":")[0]) - 1) <= horam && (+(personal.horaentradasab.split(":")[0]) + 1) >= horam) {
                        tipo = "I";
                      }
                      if ((+(personal.horasalidasab.split(":")[0]) - 1) <= horam && (+(personal.horasalidasab.split(":")[0]) + 1) >= horam) {
                        tipo = "E";
                      }

                      else { tipo = "I"; }
                    }
                    else {
                      if ((+(personal.horaentradamat.split(":")[0]) - 1) <= horam && (+(personal.horaentradamat.split(":")[0]) + 1) >= horam) {
                        tipo = "I";
                      }
                      if ((+(personal.horasalidamat.split(":")[0]) - 1) <= horam && (+(personal.horasalidamat.split(":")[0]) + 1) >= horam) {
                        tipo = "E";
                      }
                      if ((+(personal.horaentradaves.split(":")[0]) - 1) <= horam && (+(personal.horaentradaves.split(":")[0]) + 1) >= horam) {
                        tipo = "I";
                      }
                      if ((+(personal.horasalidaves.split(":")[0]) - 1) <= horam && (+(personal.horasalidaves.split(":")[0]) + 1) >= horam) {
                        tipo = "E";
                      }
                      else { tipo = "I"; }
                    }
                  }
                  //movs.push({"fechahora" : dia, "tipo": tipo, "id" : personal.id, "estado" : 1});

                  //this.storage.set('movimientos', JSON.stringify(movs)).then(d => this.servicio.envioMovimientos());
                  this.moviactual = { "fechahora": dia, "tipo": tipo, "id": personal.id, "estado": 1 };
                  
                  this.ModalMarcado(tipo, this.datePipe.transform(dia, "HH:mm:ss dd/MM/yyyy")).then((data) => {
                    this.closeScanner();
                  });
                }
              });
           
            }
            else {
              this.audio.play('error');
              this.presentAlert('Código erróneo ' + text + ", " + code).then((data) => {
                this.closeScanner();
              });
            }
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
    if (tipo == "I") {
      return "Ingreso";
    }
    else if (tipo == "E") {
      return "Egreso"
    }
    else return "";
  }

  generacode(): string {
    let dia = new Date();
    let cod = "";
    let d = +this.datePipe.transform(dia, "dd");
    let m = +this.datePipe.transform(dia, "MM");
    let a = +this.datePipe.transform(dia, "yyyy");
    cod = this.datePipe.transform(dia, "yyyyMMdd");
    cod += (d + m + a).toString();
    cod += (a - m - d).toString();
    cod += (a * m * d).toString();
    return "MUTUAL" + cod;
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

  async ModalMarcado(t, h) {

    let color;
    if (t == "I") { color = "success"; }
    else if (t == "E") { color = "primary"; }
    const alert = await this.alertController.create({
      header: this.nombreape,
      message: this.gettipo(t) + ", hora: " + h,
      inputs: [
        {
          name: 'observaciones',
          placeholder: 'Coloque observaciones si necesita',
          type: 'text'
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: () => {
            this.moviactual = null;
          }
        },
        {
          text: 'Confirmar',
          handler: (inputs: { observaciones: string }) => {
            this.marcarmovimiento(inputs.observaciones);
          }
        }
      ]
    });

    alert.present();

  }


  async ToastMarcado(t, h) {
    let color;
    if (t == "I") { color = "success"; }
    else if (t == "E") { color = "primary"; }
    const toast = await this.toastController.create({
      header: this.nombreape,
      message: this.gettipo(t) + ", hora: " + h,
      position: 'middle',
      color: color,
      duration: 5000,
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

  marcarmovimiento(obs) {
    //this.nrosocio = personal.nrosocio;
    this.storage.get('movimientos').then((movs) => {
      this.moviactual.observaciones = obs;
      if (movs == null) {
        movs = new Array();
        movs.push(this.moviactual);

        this.servicio.sinsubir = 0;
        for (let n of movs) {
          if (n.estado == 1) {
            this.servicio.sinsubir++;
          }
        }

        this.storage.set('movimientos', JSON.stringify(movs))
          .then(d => { this.servicio.envioMovimientos(); this.ToastMarcado(this.moviactual.tipo, this.moviactual.fechahora); this.moviactual = null; });
      }
      else {
        movs = JSON.parse(movs);
        movs.push(this.moviactual);
        this.servicio.sinsubir = 0;
        for (let n of movs) {
          if (n.estado == 1) {
            this.servicio.sinsubir++;
          }
        }
        this.storage.set('movimientos', JSON.stringify(movs))
          .then(d => { this.servicio.envioMovimientos(); this.ToastMarcado(this.moviactual.tipo, this.moviactual.fechahora); this.moviactual = null; });
      }

    });
  }

  registramov(t) {
    this.moviactual.tipo = t;
    this.seleccionar = false;
    this.ModalMarcado(t, this.datePipe.transform(this.moviactual.fechahora, "HH:mm:ss dd/MM/yyyy")).then((data) => {
      this.closeScanner();
    });
  }

  testmarcado() {
    this.storage.get('personal').then((pers) => {
      if (pers != null) {
        this.audio.play('marcar');
        let personal = JSON.parse(pers);
        this.nombreape = personal.nombre + ", " + personal.apellido;
        //this.nrosocio = personal.nrosocio;
        // this.storage.get('movimientos').then((movs) => {
        //   if(movs == null){
        let tipo = "";
        // movs = new Array();
        let dia = new Date();
        console.log(personal);
        let horam: number = +this.datePipe.transform(dia, "HH");
        if (personal.horaentradamat == "" && personal.horasalidamat == "" && personal.horaentradaves == "" && personal.horasalidaves == "") {
          this.seleccionar = true;
          this.moviactual = { "fechahora": dia, "id": personal.id, "estado": 1 }; return;
        }
        else {
          if ((+(personal.horaentradamat.split(":")[0]) - 1) <= horam && (+(personal.horaentradamat.split(":")[0]) + 1) >= horam) {
            tipo = "I";
          }
          if ((+(personal.horasalidamat.split(":")[0]) - 1) <= horam && (+(personal.horasalidamat.split(":")[0]) + 1) >= horam) {
            tipo = "E";
          }
          if ((+(personal.horaentradaves.split(":")[0]) - 1) <= horam && (+(personal.horaentradaves.split(":")[0]) + 1) >= horam) {
            tipo = "I";
          }
          if ((+(personal.horasalidaves.split(":")[0]) - 1) <= horam && (+(personal.horasalidaves.split(":")[0]) + 1) >= horam) {
            tipo = "E";
          }
          else { tipo = "I"; }
        }
        //movs.push({"fechahora" : dia, "tipo": tipo, "id" : personal.id, "estado" : 1});
        this.moviactual = { "fechahora": dia, "tipo": tipo, "id": personal.id, "estado": 1 };

        //this.storage.set('movimientos', JSON.stringify(movs)).then(d => this.servicio.envioMovimientos());

        this.ModalMarcado(tipo, this.datePipe.transform(dia, "HH:mm:ss dd/MM/yyyy")).then((data) => {
          this.closeScanner();
        });

       
      }
    });
  }
}
