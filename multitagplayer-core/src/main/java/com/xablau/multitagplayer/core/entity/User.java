
package com.xablau.multitagplayer.core.entity;


import java.io.Serializable;
import java.util.Date;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.NamedQueries;
import javax.persistence.NamedQuery;
import javax.persistence.SequenceGenerator;
import javax.persistence.Table;

import org.springframework.core.style.ToStringCreator;


@Entity
@Table(name = "MTP_User")
@NamedQueries({
	@NamedQuery(name = User.FROM_EMAIL, query = User.FROM_EMAIL_QUERY)
})
public class User implements Serializable {

	public static final String FROM_EMAIL = "USER_FROM_EMAIL";
	public static final String FROM_EMAIL_QUERY = "SELECT u FROM User u WHERE u.email = ?";
	
	private static final long serialVersionUID = 1782863734300252111L;
	
	private String id;
	private String email;
	private String accessToken;
	private Date expiresAt;
	private String refreshToken;

	@Id
	@GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "multitagplayer")
	@SequenceGenerator(name = "multitagplayer", sequenceName = "MTP_SEQUENCE")
	public String getId() {
		return this.id;
	}

	public void setId(String id) {
		this.id = id;
	}

	public String getEmail() {
		return email;
	}

	public void setEmail(String email) {
		this.email = email;
	}

	public String getAccessToken() {
		return accessToken;
	}

	public void setAccessToken(String accessToken) {
		this.accessToken = accessToken;
	}

	public Date getExpiresAt() {
		return expiresAt;
	}

	public void setExpiresAt(Date expiresAt) {
		this.expiresAt = expiresAt;
	}

	public String getRefreshToken() {
		return refreshToken;
	}

	public void setRefreshToken(String refreshToken) {
		this.refreshToken = refreshToken;
	}

	@Override
	public int hashCode() {
		final int prime = 31;
		int result = 1;
		result = prime * result + ((email == null) ? 0 : email.hashCode());
		return result;
	}

	@Override
	public boolean equals(Object obj) {
		if (this == obj)
			return true;
		if (obj == null)
			return false;
		if (getClass() != obj.getClass())
			return false;
		User other = (User) obj;
		if (email == null) {
			if (other.email != null)
				return false;
		} else if (!email.equals(other.email))
			return false;
		return true;
	}

	@Override
	public String toString() {
		return new ToStringCreator(this).append("id", this.id).append("email", this.email).toString();
	}
}
