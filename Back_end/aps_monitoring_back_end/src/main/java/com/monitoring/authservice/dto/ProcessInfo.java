package com.monitoring.authservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ProcessInfo {
    private String processInstanceId;
    private String processDefinitionId;
    private LocalDateTime processStartTime;
    private String processInitiator;


}
