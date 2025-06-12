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
@Table("users")
public class Users {

    @Id
    private int id;
    private String pass_word;
    private String first_name;
    private String last_name;
    private String email;
    private String company;
    private Instant created;
    private int status;
    private int account_type;
    private int tenant_id;
    private int picture_image_id;
    private Instant last_update;
    private String external_id;
    private Instant last_sync_timestamp;
    private int last_sync_timestamp_epoch;
    private String external_original_src;
    private int primary_group_id;

}
