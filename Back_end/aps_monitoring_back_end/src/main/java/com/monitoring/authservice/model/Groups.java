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
@Table("groups")
public class Groups {

    @Id
    private int id;
    private String name;
    private int tenant_id;
    private int group_type;
    private int parent_group_id;
    private Instant last_update;
    private String external_id;
    private Instant last_sync_timestamp;
    private int last_sync_timestamp_epoch;
    private int status;
    private int manager_group_id;

}
