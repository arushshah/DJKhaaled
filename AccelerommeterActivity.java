package com.example.kartik.acceldata;

import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.hardware.SensorManager;
import android.hardware.SensorEvent;
import android.hardware.SensorEventListener;
import android.hardware.Sensor;
import android.util.Log;
import android.widget.Toast;
import java.util.ArrayList;

public class AccelerometerActivity extends AppCompatActivity implements SensorEventListener {

    SensorManager SM;
    Sensor myAccel;

    private float readX;
    private float readY;
    private float readZ;
    private long time;

    ArrayList<Float> sensorData = new ArrayList<Float>();

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        time = System.currentTimeMillis();
        setContentView(R.layout.activity_accelerometer);
        //sensor manager
        SM = (SensorManager)getSystemService(SENSOR_SERVICE);

        //sensor
        myAccel = SM.getDefaultSensor(Sensor.TYPE_ACCELEROMETER);

        //sensor Listener
        SM.registerListener(this, myAccel, 200);
        }
    public void onSensorChanged(SensorEvent event) {
        Sensor mySensor = event.sensor;
        if (mySensor.getType() == Sensor.TYPE_ACCELEROMETER) {
            if(System.currentTimeMillis()-time >= 200){
                time = System.currentTimeMillis();
                    readX = event.values[0];//adds x
                    readY = event.values[1];//adds y
                    readZ = event.values[2]-9;//adds z
                Toast.makeText(this, "Accelerometer hit", Toast.LENGTH_SHORT).show();
                sensorData.add(readX);
                sensorData.add(readY);
                sensorData.add(readZ);
                Log.i("Debug", convertData());
                sensorData.clear();
                //Log.i("Debug", "Y: "+readY+"");
                //Log.i("Debug", "Z: "+readZ+"");
            }
        }
    }
    public String convertData() {
        String dataStream = sensorData.toString();
        dataStream = dataStream.replace("[", "");//gets rid of bracket in string
        dataStream = dataStream.replace("]", "");//gets rid of bracket in string
        dataStream = dataStream.replace(", ", "%20");//replaces "," with "%20" for browser interpretation
        return dataStream;
    }
    protected void onPause() {
        super.onPause();
        SM.unregisterListener(this);
    }
    protected void onResume() {
        super.onResume();
        SM.registerListener(this, myAccel, SensorManager.SENSOR_DELAY_NORMAL);
    }
    @Override
    public void onAccuracyChanged(Sensor sensor, int acc) {

        }
    }


