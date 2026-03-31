package com.mslx.manager;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.Service;
import android.content.Intent;
import android.os.Build;
import android.os.IBinder;
import android.os.SystemClock;

import androidx.core.app.NotificationCompat;
import androidx.core.app.NotificationManagerCompat;

public class ForegroundService extends Service {
    private static final String CHANNEL_ID = "mslx_manager_channel";
    private static final String CHANNEL_NAME = "MSLX Manager Service";
    private static final int NOTIFICATION_ID = 1001;
    private static final String STOP_ACTION = "com.mslx.manager.STOP_ACTION";
    private static final String EXTRA_SERVER_NAME = "server_name";
    private static final String EXTRA_SERVER_STATUS = "server_status";

    private String serverName = "MSLX Manager";
    private String serverStatus = "运行中";
    private long startTime = 0;

    public ForegroundService() {
        super();
    }

    @Override
    public void onCreate() {
        super.onCreate();
        createNotificationChannel();
        startTime = SystemClock.elapsedRealtime();
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        if (intent != null) {
            if (STOP_ACTION.equals(intent.getAction())) {
                stopForeground(STOP_FOREGROUND_REMOVE);
                stopSelf();
                android.os.Process.killProcess(android.os.Process.myPid());
                return START_NOT_STICKY;
            }

            String name = intent.getStringExtra(EXTRA_SERVER_NAME);
            String status = intent.getStringExtra(EXTRA_SERVER_STATUS);
            if (name != null) serverName = name;
            if (status != null) serverStatus = status;
        }

        startForeground(NOTIFICATION_ID, buildNotification());
        return START_STICKY;
    }

    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                    CHANNEL_ID,
                    CHANNEL_NAME,
                    NotificationManager.IMPORTANCE_LOW
            );
            channel.setDescription("显示 MSLX Manager 运行状态");
            channel.setShowBadge(false);
            channel.enableLights(false);
            channel.enableVibration(false);

            NotificationManager manager = getSystemService(NotificationManager.class);
            if (manager != null) {
                manager.createNotificationChannel(channel);
            }
        }
    }

    private android.app.Notification buildNotification() {
        long elapsedMillis = SystemClock.elapsedRealtime() - startTime;
        long hours = elapsedMillis / (1000 * 60 * 60);
        long minutes = (elapsedMillis / (1000 * 60)) % 60;
        String uptime = String.format("运行时间: %d小时%d分钟", hours, minutes);

        Intent mainIntent = new Intent(this, com.mslx.manager.MainActivity.class);
        mainIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        android.app.PendingIntent mainPendingIntent = android.app.PendingIntent.getActivity(
                this, 0, mainIntent,
                android.app.PendingIntent.FLAG_UPDATE_CURRENT | android.app.PendingIntent.FLAG_IMMUTABLE
        );

        Intent stopIntent = new Intent(this, ForegroundService.class);
        stopIntent.setAction(STOP_ACTION);
        android.app.PendingIntent stopPendingIntent = android.app.PendingIntent.getService(
                this, 1, stopIntent,
                android.app.PendingIntent.FLAG_UPDATE_CURRENT | android.app.PendingIntent.FLAG_IMMUTABLE
        );

        return new NotificationCompat.Builder(this, CHANNEL_ID)
                .setContentTitle(serverName)
                .setContentText(serverStatus + " • " + uptime)
                .setSmallIcon(android.R.drawable.ic_dialog_info)
                .setOngoing(true)
                .setOnlyAlertOnce(true)
                .setContentIntent(mainPendingIntent)
                .addAction(android.R.drawable.ic_delete, "STOP", stopPendingIntent)
                .setPriority(NotificationCompat.PRIORITY_LOW)
                .setCategory(NotificationCompat.CATEGORY_SERVICE)
                .build();
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        stopForeground(STOP_FOREGROUND_REMOVE);
    }
}
