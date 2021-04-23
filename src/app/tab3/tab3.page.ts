import { Component } from '@angular/core';
import { AlertController, ToastController } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { ComunicacionService } from '../servicios/comunicacion.service';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page {
  //panel de configuración
  nombreape; nrosocio; entsalmat; entsalves; entsalsab; codigo; url;

  ionViewWillEnter() {
    this.storage.get('url').then((url) => {
      this.url = url;
      if(this.url == null){
        this.url = 'http://192.168.0.125/mdtReloj/';
      }

      this.storage.get('codigo').then((codigo) => {
        if (codigo != null) {
          this.codigo = codigo; 
          this.comunicacion.loadcodigo(codigo).subscribe(d => {
            if (d != null) {
              this.presentAlert("correctamente establecida", "Conexión", "success", 1000).then((data) => {
                this.nombreape = d.data[0][0].nombre + ", " + d.data[0][0].apellido;
                this.nrosocio = d.data[0][0].nrosocio;
                this.entsalmat = d.data[0][0].horaentradamat + " hasta " + d.data[0][0].horasalidamat;
                this.entsalves = d.data[0][0].horaentradaves + " hasta " + d.data[0][0].horasalidaves;
                this.entsalsab = d.data[0][0].horaentradasab + " hasta " + d.data[0][0].horasalidasab;
              });
            }
            else {
              this.presentAlert("El código ingresado no obtuvo resultados", "Fallo conexión").then((data) => {
                this.storage.get('personal').then((pers) => {
                  if (pers != null) {
                    let personal = JSON.parse(pers);
                    this.nombreape = personal.nombre + ", " + personal.apellido;
                    this.nrosocio = personal.nrosocio;
                    this.entsalmat = personal.horaentradamat + " hasta " + personal.horasalidamat;
                    this.entsalves = personal.horaentradaves + " hasta " + personal.horasalidaves;
                    this.entsalsab = personal.horaentradasab + " hasta " + personal.horasalidasab;
                    this.codigo = personal.codigomarcado;
                  }

                });
              });

            }
          }, error => {
            this.presentAlert("No se pudo establecer conexión con el servidor", "Fallo conexión").then((data) => {
              this.storage.get('personal').then((pers) => {
                if (pers != null) {
                  let personal = JSON.parse(pers);
                  this.nombreape = personal.nombre + ", " + personal.apellido;
                  this.nrosocio = personal.nrosocio;
                  this.entsalmat = personal.horaentradamat + " hasta " + personal.horasalidamat;
                  this.entsalves = personal.horaentradaves + " hasta " + personal.horasalidaves;
                  this.entsalsab = personal.horaentradasab + " hasta " + personal.horasalidasab;
                  this.codigo = personal.codigomarcado;
                }
              });
            });


          });

        }
      });
    });
  }

  async presentAlert(mensaje, head, color = "danger", tiempo = 6000) {

    const toast = await this.toastController.create({
      header: head,
      message: mensaje,
      position: 'bottom',
      color: color,
      duration: tiempo,
      buttons: [

        {
          text: 'Aceptar',
          role: 'cancel',
          handler: () => {
            //console.log('Cancel clicked');
          }
        }
      ]
    });
    toast.present();
  }

  constructor(public alertController: AlertController, public toastController: ToastController, private storage: Storage, private comunicacion: ComunicacionService) {

  }


  cargarcodigo() {
    this.storage.set('codigo', this.codigo).then(d => {
      this.comunicacion.url = this.url;
      this.comunicacion.loadcodigo(this.codigo).subscribe(d => {
        if (d != null && d.data[0].length > 0) {
          this.presentAlert("correctamente establecida", "Conexión", "success", 1000).then((data) => {
          // if(){
          this.storage.set('personal', JSON.stringify(d.data[0][0]));
          this.nombreape = d.data[0][0].nombre + ", " + d.data[0][0].apellido;
          this.nrosocio = d.data[0][0].nrosocio;
          this.entsalmat = d.data[0][0].horaentradamat + " hasta " + d.data[0][0].horasalidamat;
          this.entsalves = d.data[0][0].horaentradaves + " hasta " + d.data[0][0].horasalidaves;
          this.entsalsab = d.data[0][0].horaentradasab + " hasta " + d.data[0][0].horasalidasab;});
        }
        else {
          this.presentAlert("El código ingresado no obtuvo resultados", "Código erróneo").then((data) => {
            this.storage.get('personal').then((pers) => {
              if (pers != null) {
                let personal = JSON.parse(pers);
                this.nombreape = personal.nombre + ", " + personal.apellido;
                this.nrosocio = personal.nrosocio;
                this.entsalmat = personal.horaentradamat + " hasta " + personal.horasalidamat;
                this.entsalves = personal.horaentradaves + " hasta " + personal.horasalidaves;
                this.entsalsab = personal.horaentradasab + " hasta " + personal.horasalidasab;

              }
            });
          });
        }
      },
        error => {
          this.presentAlert("No se pudo establecer conexión con el servidor", "Error de conexión").then((data) => {
            this.storage.get('personal').then((pers) => {
              if (pers != null) {
                let personal = JSON.parse(pers);
                this.nombreape = personal.nombre + ", " + personal.apellido;
                this.nrosocio = personal.nrosocio;
                this.entsalmat = personal.horaentradamat + " hasta " + personal.horasalidamat;
                this.entsalves = personal.horaentradaves + " hasta " + personal.horasalidaves;
                this.entsalsab = personal.horaentradasab + " hasta " + personal.horasalidasab;
                this.codigo = personal.codigomarcado;
              }
            });
          });
        });
    });
  }

  async ModalUrl() {
    const alert = await this.alertController.create({
      header: "Modificar URL de conexión",
      message: "",
      inputs: [
        {
          name: 'ul',
          placeholder: 'Url nueva',
          type: 'text'
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: () => {

          }
        },
        {
          text: 'Confirmar',
          handler: (inputs: { ul: string }) => {
            this.url = inputs.ul;
            this.storage.set('url', inputs.ul).then(d => this.cargarcodigo());
          }
        }
      ]
    });

    alert.present();

  }
  async ModalCodigo() {
    const alert = await this.alertController.create({
      header: "Modificar código de ingreso",
      message: "",
      inputs: [
        {
          name: 'codigo',
          placeholder: 'Cambio de código',
          type: 'text'
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: () => {

          }
        },
        {
          text: 'Confirmar',
          handler: (inputs: { codigo: string }) => {
            this.codigo = inputs.codigo;
            this.cargarcodigo();
          }
        }
      ]
    });

    alert.present();

  }

}
