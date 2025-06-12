package com.monitoring.authservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StatusCount {
    private String status;
    private Long total;

    public String getStatusLabel() {
        switch(status.toLowerCase()) {
            case "actif": return "Active";
            case "suspendu": return "Suspended";
            case "terminé": return "Completed";
            default: return "Other";
        }
    }
}