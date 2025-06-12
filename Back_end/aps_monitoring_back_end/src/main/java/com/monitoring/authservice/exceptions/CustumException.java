package com.monitoring.authservice.exceptions;

import com.monitoring.authservice.dto.ResponseDto;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

@ControllerAdvice
public class CustumException {

    @ExceptionHandler(Exception.class)
    public ResponseDto<String> handleException(Exception e) {
        return new ResponseDto<>(-1, -1, "Erreur lors de l'appel d'API", e.getMessage());
    }

}
