
package com.xablau.multitagplayer.controller;


import static org.springframework.web.bind.annotation.RequestMethod.GET;
import static org.springframework.web.bind.annotation.RequestMethod.POST;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

import com.xablau.multitagplayer.core.entity.MusicDao;


@Controller
@RequestMapping("/music")
public class MusicController {

    @Autowired
    private MusicDao dao;

    @RequestMapping(value = "/save", method = { GET, POST })
    public void save(String name, String path) {
        this.dao.createMusic(name, path);
    }
}
