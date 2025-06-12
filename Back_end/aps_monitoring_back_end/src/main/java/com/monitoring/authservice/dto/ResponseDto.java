package com.monitoring.authservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class ResponseDto<T> {

    private int status;
    private int responseCode;
    private Double nbreTotal;
    private String responseMessage;
    T responseObject;

    public ResponseDto(int i, int i1, String s, String message) {
    }
}
