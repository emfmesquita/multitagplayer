package com.xablau.multitagplayer.core;

import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;

import org.junit.Assert;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;
import org.springframework.transaction.annotation.Transactional;

import com.xablau.multitagplayer.core.entity.TestEntity;

@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration("/test-spring-config.xml")
@Transactional
public class EntityTest {
	
	@PersistenceContext
	private EntityManager em;
	
	@Test
	public void test(){
		TestEntity teste1 = this.persist("teste1");
		TestEntity teste2 = this.persist("teste2");
		TestEntity teste3 = this.persist("teste3");
		em.flush();
		this.assertTeste(teste1);
		this.assertTeste(teste2);
		this.assertTeste(teste3);
	}
	
	private TestEntity persist(String name){
		TestEntity teste = this.createTeste("teste");
		em.persist(teste);
		return teste;
	}
	
	private void assertTeste(TestEntity teste){
		TestEntity dbTeste = em.find(TestEntity.class, teste.getId());
		System.out.println(dbTeste.getId() + ":" + dbTeste.getName());
		Assert.assertEquals(teste.getId(), dbTeste.getId());
		Assert.assertEquals(teste, dbTeste);
	}
	
	private TestEntity createTeste(String name){
		TestEntity teste = new TestEntity();
		teste.setName(name);
		return teste;
	}
}
