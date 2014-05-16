package com.xablau.multitagplayer.core;

import org.junit.Assert;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration("/test-spring-config.xml")
public class SimpleBeanTest {

	@Autowired
	private SimpleBean simpleBean;
	
	@Test
	public void test(){
		Assert.assertEquals(SimpleBean.SERVICE_RETURN, simpleBean.service());
	}
}
