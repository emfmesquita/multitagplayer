package com.xablau.multitagplayer.core.entity;

import java.io.Serializable;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.SequenceGenerator;
import javax.persistence.Table;

import org.springframework.core.style.ToStringCreator;

@Entity
@Table(name = "MTP_Music")
public class Music implements Serializable {

	private static final long serialVersionUID = -1812206570927373392L;

	private String id;
	private String name;

	@Id
	@GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "multitagplayer")
	@SequenceGenerator(name = "multitagplayer", sequenceName = "MTP_SEQUENCE")
	public String getId() {
		return id;
	}

	public void setId(String id) {
		this.id = id;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	@Override
	public boolean equals(Object obj) {
		if (this == obj)
			return true;
		if (obj == null)
			return false;
		if (getClass() != obj.getClass())
			return false;
		Music other = (Music) obj;
		if (name == null) {
			if (other.name != null)
				return false;
		} else if (!name.equals(other.name))
			return false;
		return true;
	}
	
	@Override
	public String toString() {
		return new ToStringCreator(this).append("id", this.id).append("name", this.name).toString();
	}
}
