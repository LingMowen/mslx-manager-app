package com.mslx.manager;

import android.os.Bundle;
import android.webkit.WebSettings;
import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // 配置 WebView 设置以支持 Android 16
        WebView webView = getBridge().getWebView();
        WebSettings settings = webView.getSettings();
        
        // 启用 JavaScript
        settings.setJavaScriptEnabled(true);
        
        // 启用 DOM storage
        settings.setDomStorageEnabled(true);
        
        // 启用数据库
        settings.setDatabaseEnabled(true);
        
        // 允许混合内容（HTTP 和 HTTPS）
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
        
        // 允许访问文件
        settings.setAllowFileAccess(true);
        settings.setAllowContentAccess(true);
        
        // 启用缓存
        settings.setCacheMode(WebSettings.LOAD_DEFAULT);
        
        // 设置用户代理
        settings.setUserAgentString(settings.getUserAgentString() + " MSLX-Manager/1.0");
    }
    
    @Override
    public void onBackPressed() {
        // 获取 WebView
        WebView webView = getBridge().getWebView();
        
        // 如果 WebView 可以返回，则执行返回操作
        if (webView.canGoBack()) {
            webView.goBack();
        } else {
            // 否则执行默认行为（返回到上一级或退出）
            super.onBackPressed();
        }
    }
}
