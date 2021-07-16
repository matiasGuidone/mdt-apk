import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpRequest } from '@angular/common/http';
import { Storage } from '@ionic/storage';
import { Observable } from 'rxjs';
import { DatePipe } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class ComunicacionService {
  public url;
  movimientos = new Array();
  env = new Array(); 
  sinsubir : number = 0;
  public movsenvio = new Array();
  

  constructor(public _http: HttpClient, private storage: Storage, private datePipe: DatePipe) { 
    this.storage.get('url').then((url) => { this.url = url }); 
  }

   envioMovimientos() {
    this.storage.get("movimientos").then((movs) => {
      if (movs != null) {
        this.movsenvio = new Array();
        this.movimientos = JSON.parse(movs); 
                      for(let n of this.movimientos){
                        if(n.estado ==1){ 
                          this.movsenvio.push(n);
                        } 
                      }
                      this.enviarMovs(this.movsenvio); 
                    }});
   }


  enviarMovs(movimientos: any[]){
    const header = new HttpHeaders({ 'Access-Control-Allow-Origin': '*' });
    let movimientosenvio = new Array();
    for(let mov of movimientos){
     mov.fechahora = this.datePipe.transform(mov.fechahora, "yyyy-MM-dd HH:mm:ss");
     movimientosenvio.push(mov);
    }
    
    this._http.post<any>(this.url+"movs", movimientosenvio, { headers: header }).subscribe(d => {
      if (d.result == "OK") {
        for (let mv of this.movsenvio){
          let ind = this.movimientos.findIndex(ind => ind.fechahora == mv.fechahora && ind.id == mv.id );
          this.movimientos[ind].estado = 2
         }
         this.sinsubir = 0;
         for (let n of this.movimientos) {
           if (n.estado == 1) {
             this.sinsubir++;
           }
         }
         this.storage.set("movimientos", JSON.stringify(this.movimientos)).then(() => {
            console.log("movimientos sincronizados");});

      };
    });
  }



  loadcodigo(codigo): Observable<any> {
    try {
     
        const header = new HttpHeaders({ 'codigomdt': codigo, 'Access-Control-Allow-Origin': '*' });
        return this._http.get<any>(this.url+"personal", { headers: header });
      
    } catch (e) { return null; }
  }

  test(url): Observable<any> {
    try {
     
        const header = new HttpHeaders({  'Access-Control-Allow-Origin': '*' });
        return this._http.get<any>(url+"test", { headers: header });
      
    } catch (e) { return null; }
  }
  
}
