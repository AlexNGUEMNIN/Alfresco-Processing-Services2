package com.monitoring.authservice.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

import java.time.Instant;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Table("act_re_deployment")
public class ActReDeployment {

    @Id
    private String id_;
    private String name_;
    private String category_;
    private String tenant_id_;
    private Instant deploy_time_;

}
