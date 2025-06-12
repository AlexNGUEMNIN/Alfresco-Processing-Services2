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
@Table("act_hi_varinst")
public class ActHiVarinst {

    @Id
    private String id_;
    private String proc_inst_id_;
    private String execution_id_;
    private String task_id_;
    private String name_;
    private String var_type_;
    private int rev_;
    private String bytearray_id_;
    private float double_;
    private int long_;
    private String text_;
    private String text2_;
    private Instant create_time_;
    private Instant last_updated_time_;

}
