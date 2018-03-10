import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import PouchDB from 'pouchdb';
import {API_ENDPOINT, DATABASE_NAME} from '../../assets/Constants/PouchConstants';

/*
  Generated class for the TodosProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class TodosProvider {

  data: any;
  db: any;
  remote: any;

  constructor(public http: HttpClient) {
    this.db = new PouchDB(DATABASE_NAME);


    this.remote = API_ENDPOINT;

    let options = {
      live: true,
      retry: true,
      continuous: true
    };

    this.db.sync(this.remote, options);

  }


  getTodosProvider(type) {
    if (this.data) {
      return Promise.resolve(this.data);
    }

    return new Promise(resolve => {

      this.db.allDocs({

        include_docs: true

      }).then((result) => {

        this.data = [];

        let docs = result.rows.map((row) => {
          this.data.push(row.doc);
        });

        resolve(this.data);
        debugger;
        this.db.changes({
          live: true, since: 'now', include_docs: true,
          filter: type//değişen değerleri filtreleyebilmek için fonksiyon yazılması gerekiyor.
          //bunu bu şekilde değişken fonksiyon olarak yaptık.
        }).on('change', (change) => {
          this.handleChange(change);
        });

      }).catch((error) => {

        console.log(error);

      });

    });
  }

  handleChange(change) {
    debugger;

    let changedDoc = null;
    let changedIndex = null;
    this.data.forEach((doc, index) => {

      if (doc._id === change.id) {
        changedDoc = doc;
        changedIndex = index;
      }

    });


    //A document was deleted
    if (change.deleted) {
      this.data.splice(changedIndex, 1);
    }
    else {

      //A document was updated
      if (changedDoc) {
        this.data[changedIndex] = change.doc;
      }

      //A document was added
      else {
        this.data.push(change.doc);
      }

    }
  }

  createTodosProvider(todo) {
    // bizim db ye kayıt gonderirken kullanacağımız method
    this.db.post(todo);
  }

  updateTodosProvider(todo) {
    // bizim db de update yaparken kullanacağımız method
    this.db.put(todo).catch((err) => {
      console.log(err);
    });
  }

  deleteTodosProvider(todo) {
    // bizim db de kayıt silerken kullanacağımız method
    this.db.remove(todo).catch((err) => {
      console.log(err);
    });
  }


}
