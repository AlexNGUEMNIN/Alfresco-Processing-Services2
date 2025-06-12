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
@Table("act_hi_actinst")
public class ActHiActinst {

    @Id
    private String id_;
    private String proc_def_id_;
    private String proc_inst_id_;
    private String execution_id_;
    private String act_id_;
    private String task_id_;
    private String call_proc_inst_id_;
    private String act_name_;
    private String act_type_;
    private String assignee_;
    private Instant start_time_;
    private Instant end_time_;
    private int duration_;
    private String tenant_id_;

}
