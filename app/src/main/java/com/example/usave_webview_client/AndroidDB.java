package com.example.usave_webview_client;

import android.content.Context;
import android.database.Cursor;
import android.database.sqlite.SQLiteDatabase;
import android.util.Log;
import android.webkit.JavascriptInterface;

import org.json.JSONArray;
import org.json.JSONObject;

public class AndroidDB {
    private static final String TAG = "AndroidDB";
    private SQLiteDatabase db;
    private String dbPath;

    public AndroidDB(Context context) {
        try {
            dbPath = context.getDatabasePath("save.db").getAbsolutePath();
            Log.d(TAG, "Opening database at: " + dbPath);

            db = context.openOrCreateDatabase("save.db", Context.MODE_PRIVATE, null);

            // Create users table
            db.execSQL("CREATE TABLE IF NOT EXISTS users (" +
                    "id INTEGER PRIMARY KEY AUTOINCREMENT," +
                    "name TEXT," +
                    "email TEXT," +
                    "phone TEXT," +
                    "password TEXT" +
                    ")");

            // Create transactions table
            db.execSQL("CREATE TABLE IF NOT EXISTS transactions (" +
                    "id INTEGER PRIMARY KEY AUTOINCREMENT," +
                    "user_id INTEGER NOT NULL," +  // Add this line
                    "type TEXT NOT NULL," +
                    "name TEXT NOT NULL," +
                    "amount REAL NOT NULL," +
                    "category TEXT," +
                    "date TEXT NOT NULL," +
                    "notes TEXT," +
                    "recurring INTEGER DEFAULT 0," +
                    "FOREIGN KEY (user_id) REFERENCES users(id)" + // Add this line for data integrity
                    ")");

            Log.d(TAG, "Database and tables created successfully");
        } catch (Exception e) {
            Log.e(TAG, "Database initialization error: " + e.getMessage());
        }
    }

    @JavascriptInterface
    public String query(String sql, String paramsJson) {
        Log.d(TAG, "Query called: " + sql + " with params: " + paramsJson);
        try {
            JSONArray params = new JSONArray(paramsJson);
            Cursor cursor = db.rawQuery(sql, toStringArray(params));
            JSONArray result = new JSONArray();
            while (cursor.moveToNext()) {
                JSONObject row = new JSONObject();
                for (int i = 0; i < cursor.getColumnCount(); i++) {
                    row.put(cursor.getColumnName(i), cursor.getString(i));
                }
                result.put(row);
            }
            cursor.close();
            Log.d(TAG, "Query result: " + result.toString());
            return result.toString();
        } catch (Exception e) {
            Log.e(TAG, "Query error: " + e.getMessage());
            return "[]";
        }
    }

    @JavascriptInterface
    public void execute(String sql, String paramsJson) {
        Log.d(TAG, "Execute called: " + sql + " with params: " + paramsJson);
        try {
            JSONArray params = new JSONArray(paramsJson);
            db.execSQL(sql, toStringArray(params));
            Log.d(TAG, "Execute successful");
        } catch (Exception e) {
            Log.e(TAG, "Execute error: " + e.getMessage());
        }
    }

    private String[] toStringArray(JSONArray arr) throws Exception {
        String[] out = new String[arr.length()];
        for (int i = 0; i < arr.length(); i++) {
            out[i] = arr.getString(i);
        }
        return out;
    }
}