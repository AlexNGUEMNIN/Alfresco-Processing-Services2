package com.monitoring.authservice.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;

import java.time.Instant;

@AllArgsConstructor
@NoArgsConstructor
@Data
@ToString
@Table("act_ru_execution")
public class ActRuExecution {

    @Id
    @Column("id_")
    private String id;

    @Column("rev_")
    private int rev;

    @Column("proc_inst_id_")
    private String procInstId;

    @Column("business_key_")
    private String businessKey;

    @Column("parent_id_")
    private String parentId;

    @Column("proc_def_id_")
    private String procDefId;

    @Column("super_exec_")
    private String superExec;

    @Column("act_id_")
    private String actId;

    @Column("is_active_")
    private boolean isActive;

    @Column("is_concurrent_")
    private boolean isConcurrent;

    @Column("is_scope_")
    private boolean isScope;

    @Column("is_event_scope_")
    private boolean isEventScope;

    @Column("suspension_state_")
    private int suspensionState;

    @Column("cached_ent_state_")
    private int cachedEntState;

    @Column("tenant_id_")
    private String tenantId;

    @Column("name_")
    private String name;

    @Column("lock_time_")
    private Instant lockTime;

    public String getName() {
        return name;
    }

}
