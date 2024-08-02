import { Router } from 'express';
import sqlite3 from 'sqlite3'
import { Contact } from '../entity/contact';
const db= new sqlite3.Database('db.sqlite');

const dataRouter = Router();

dataRouter.get('/', async (req, res) => {

let dataList:Contact[]=[];
function fetchContacts(): Promise<any[]> {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.each(
        'SELECT * FROM Contact',
        (err, row: Contact) => {
          if (err) {
            reject(err);
          } else {
            dataList.push(row);
          }
        },
        () => {
          resolve(dataList);
        }
      );
    });
  });
}
await fetchContacts();

  return res.json({
    contact: {
      dataList
    },
  });
});

export default dataRouter;
