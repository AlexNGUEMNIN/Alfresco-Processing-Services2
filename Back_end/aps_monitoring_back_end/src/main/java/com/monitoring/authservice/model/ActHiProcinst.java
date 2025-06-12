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
@Table("act_hi_procinst")
public class ActHiProcinst {

    @Id
    private String id_;
    private String proc_inst_id_;
    private String business_key_;
    private String proc_def_id_;
    private Instant start_time_;
    private Instant end_time_;
    private int duration_;
    private String start_user_id_;
    private String start_act_id_;
    private String end_act_id_;
    private String super_process_instance_id_;
    private String delete_reason_;
    private String tenant_id_;
    private String name_;

}
