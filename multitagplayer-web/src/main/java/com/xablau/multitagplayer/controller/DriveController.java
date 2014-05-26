
package com.xablau.multitagplayer.controller;


import static org.springframework.web.bind.annotation.RequestMethod.GET;
import static org.springframework.web.bind.annotation.RequestMethod.POST;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

import com.xablau.multitagplayer.core.entity.MusicDao;


@Controller
@RequestMapping("/drive")
public class DriveController {

    @Autowired
    private MusicDao dao;

    @RequestMapping(method = { GET, POST })
    public String open(String name, String path) {
    	return "drive";
    }
}
