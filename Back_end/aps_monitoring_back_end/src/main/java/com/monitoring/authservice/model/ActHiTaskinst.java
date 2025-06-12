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
@Table("act_hi_taskinst")
public class ActHiTaskinst {

    @Id
    private String id_;
    private String proc_def_id_;
    private String task_def_key_;
    private String proc_inst_id_;
    private String execution_id_;
    private String name_;
    private String parent_task_id_;
    private String description_;
    private String owner_;
    private String assignee_;
    private Instant start_time_;
    private Instant claim_time_;
    private Instant end_time_;
    private int duration_;
    private String delete_reason_;
    private int priority_;
    private Instant due_date_;
    private String form_key_;
    private String category_;
    private String tenant_id_;

}
