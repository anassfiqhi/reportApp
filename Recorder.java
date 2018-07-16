package com.dirisu.reportapp;

import java.io.IOException;
import java.io.File;
import java.util.Date;
import java.text.SimpleDateFormat;
import android.media.MediaPlayer;
import android.media.AudioManager;
import android.media.MediaRecorder;
import android.os.Environment;

public class Recorder {
    private static Recorder instance = null;
    MediaRecorder uprightRecorder;
    MediaPlayer mediaPlayer;
    SimpleDateFormat formatter = new SimpleDateFormat("yyyy-MM-dd_kk-mm-ss");
    String outputPath;
    Boolean playing = false;



    public Recorder() {
        uprightRecorder = new MediaRecorder();
        mediaPlayer = new MediaPlayer();
    }

    String createOutputPath() {
        File storagePath = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_MUSIC);
        String time = new SimpleDateFormat("yyyyMMdd_HHmmss").format(new Date());
        File outputFile =  new File(storagePath.getPath() + File.separator + "REC_" + time + ".3gp");
        return outputFile.getAbsolutePath();
    }

    public static Recorder getInstance() {
		if (instance == null) {
			instance = new Recorder();
		}

		return instance;
	}
        
        
    public void Start() {
        try {
            outputPath = createOutputPath();
            uprightRecorder.setAudioSource(MediaRecorder.AudioSource.DEFAULT);
            uprightRecorder.setOutputFormat(MediaRecorder.OutputFormat.THREE_GPP);
            uprightRecorder.setOutputFile(outputPath);
            uprightRecorder.setAudioEncoder(MediaRecorder.OutputFormat.AMR_NB);
            uprightRecorder.prepare();
            uprightRecorder.start();
        } catch (IllegalStateException ise) {
            ise.printStackTrace();
        } catch (IOException ioe) {
            ioe.printStackTrace();
        }
    }

    public void Stop() {
        try {
            uprightRecorder.stop();
            uprightRecorder.reset();
            uprightRecorder.release();
        } catch (Exception e) {
            e.printStackTrace();
        } 
       
    }

    public String Play() {
        try {
            if (playing == false) {
                mediaPlayer.setAudioStreamType(AudioManager.STREAM_MUSIC);
                mediaPlayer.setDataSource(outputPath);
                mediaPlayer.prepare();
                mediaPlayer.start();
                playing = true;
                return outputPath;
            } else {
                mediaPlayer.stop();
                return "stopped playing";
            }
        } catch (Exception e) {
            e.printStackTrace();
            return "recording failed";
        }
    }
}