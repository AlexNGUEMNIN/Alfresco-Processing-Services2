package com.monitoring.authservice.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.relational.core.mapping.Table;

import java.time.Instant;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Table("act_ru_task")
public class ActRuTask {

    private String id_;
    private int rev_;
    private String execution_id_;
    private String proc_inst_id_;
    private String proc_def_id_;
    private String name_;
    private String parent_task_id_;
    private String description_;
    private String task_def_key_;
    private String owner_;
    private String assignee_;
    private String delegation_;
    private int priority_;
    private Instant create_time_;
    private Instant due_date_;
    private String category_;
    private int suspension_state_;
    private String tenant_id_;
    private String form_key_;

}
