package com.monitoring.authservice.dto;

public class ProcessIntervalConfig {
    private int processusLongs;
    private int processusSansTaches;
    private int processusInitiateurSeulement;
    private int processusEchoues;

    // Getters and setters
    public int getProcessusLongs() {
        return processusLongs;
    }

    public void setProcessusLongs(int processusLongs) {
        this.processusLongs = processusLongs;
    }

    public int getProcessusSansTaches() {
        return processusSansTaches;
    }

    public void setProcessusSansTaches(int processusSansTaches) {
        this.processusSansTaches = processusSansTaches;
    }

    public int getProcessusInitiateurSeulement() {
        return processusInitiateurSeulement;
    }

    public void setProcessusInitiateurSeulement(int processusInitiateurSeulement) {
        this.processusInitiateurSeulement = processusInitiateurSeulement;
    }

    public int getProcessusEchoues() {
        return processusEchoues;
    }

    public void setProcessusEchoues(int processusEchoues) {
        this.processusEchoues = processusEchoues;
    }
}