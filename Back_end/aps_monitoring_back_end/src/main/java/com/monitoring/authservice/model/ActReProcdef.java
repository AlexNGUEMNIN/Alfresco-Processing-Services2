package com.monitoring.authservice.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Table("act_re_procdef")
public class ActReProcdef {

    @Id
    private String id_;
    private int rev_;
    private String category_;
    private String name_;
    private String key_;
    private int version_;
    private String deployment_id_;
    private String resource_name_;
    private String dgrm_resource_name_;
    private String description_;
    private boolean has_start_form_key_;
    private boolean has_graphical_notation_;
    private int suspension_state_;
    private String tenant_id_;

}
