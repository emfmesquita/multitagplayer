
package com.xablau.multitagplayer.controller;


import static org.springframework.web.bind.annotation.RequestMethod.GET;
import static org.springframework.web.bind.annotation.RequestMethod.POST;

import java.util.ResourceBundle;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.ModelMap;
import org.springframework.web.bind.annotation.RequestMapping;

import com.xablau.multitagplayer.core.entity.MusicDao;


@Controller
@RequestMapping("/")
public class IndexController {

    @Autowired
    private MusicDao dao;
    
    @RequestMapping(method = { GET, POST })
    public String index(ModelMap model) {
    	ResourceBundle rb = ResourceBundle.getBundle("application");
    	
        model.addAttribute("version", rb.getString("application.version"));
        model.addAttribute("musics", this.dao.list());
        return "index";
    }
}
