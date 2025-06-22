// react-native-sqlite-storage.d.ts
declare module 'react-native-sqlite-storage' {
    export type SQLiteDatabase = {
      transaction: (
        callback: (tx: SQLiteTransaction) => void,
        error?: (error: SQLError) => void,
        success?: () => void
      ) => void;
      executeSql: (
        sqlStatement: string,
        args?: any[],
        success?: (tx: SQLiteTransaction, result: SQLResultSet) => void,
        error?: (error: SQLError) => void
      ) => void;
      close: () => void;
    };
  
    export type SQLiteTransaction = {
      executeSql: (
        sqlStatement: string,
        args?: any[],
        success?: (tx: SQLiteTransaction, result: SQLResultSet) => void,
        error?: (error: SQLError) => void
      ) => void;
    };
  
    export type SQLResultSet = {
      rows: {
        _array(arg0: string, _array: any): unknown;
        length: number;
        item: (index: number) => any;
      };
      rowsAffected: number;
      insertId?: number;
    };
  
    export type SQLError = {
      code: number;
      message: string;
    };
  
    export function openDatabase(
      params:
        | {
            name: string;
            location: 'default' | string;
            createFromLocation?: number | string;
          }
        | string,
      success?: () => void,
      error?: (error: SQLError) => void
    ): SQLiteDatabase;
  
    export function enablePromise(enabled: boolean): void;
    export function DEBUG(enabled: boolean): void;
  }
  