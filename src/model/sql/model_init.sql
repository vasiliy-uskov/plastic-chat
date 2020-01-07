SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

CREATE SCHEMA IF NOT EXISTS plastic_chat DEFAULT CHARACTER SET utf8 ;
USE plastic_chat ;

CREATE TABLE IF NOT EXISTS file (
    file_id BINARY(16) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    creating_date TIMESTAMP NOT NULL,
    UNIQUE INDEX id_UNIQUE (file_id ASC),
    PRIMARY KEY (file_id))
    ENGINE = InnoDB;


CREATE TABLE IF NOT EXISTS user (
    user_id BINARY(16) NOT NULL,
    first_name VARCHAR(255) NULL,
    last_name VARCHAR(255) NULL,
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    gender TINYINT NOT NULL,
    avatar_id BINARY(16) NULL,
    PRIMARY KEY (user_id),
    UNIQUE INDEX email_UNIQUE (email ASC),
    UNIQUE INDEX user_id_UNIQUE (user_id ASC),
    INDEX avatar_id_idx (avatar_id ASC),
    CONSTRAINT avatar_id
        FOREIGN KEY (avatar_id)
            REFERENCES file (file_id)
            ON DELETE SET NULL
            ON UPDATE SET NULL)
    ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS file_access_right (
    file_access_right_id BINARY(16) NOT NULL,
    file_id BINARY(16) NOT NULL,
    user_id BINARY(16) NOT NULL,
    file_access_right_type TINYINT NOT NULL,
    PRIMARY KEY (file_access_right_id),
    UNIQUE INDEX file_access_right_id_UNIQUE (file_access_right_id ASC),
    UNIQUE INDEX file_id_user_id_UNIQUE (file_id, user_id),
    INDEX fk_file_access_right_file1_idx (file_id ASC),
    INDEX fk_file_access_right_user1_idx (user_id ASC),
    INDEX fk_file_access_right_file_access_right_type1_idx (file_access_right_type ASC),
    CONSTRAINT fk_file_access_right_file1
        FOREIGN KEY (file_id)
            REFERENCES file (file_id)
            ON DELETE CASCADE
            ON UPDATE CASCADE,
    CONSTRAINT fk_file_access_right_user1
        FOREIGN KEY (user_id)
            REFERENCES user (user_id)
            ON DELETE CASCADE
            ON UPDATE CASCADE)
    ENGINE = InnoDB;


CREATE TABLE IF NOT EXISTS users_relationship (
    users_relationship_id BINARY(16) NOT NULL,
    left_user_id BINARY(16) NOT NULL,
    right_user_id BINARY(16) NOT NULL,
    users_relationship_type TINYINT NOT NULL,
    PRIMARY KEY (users_relationship_id),
    INDEX fk_users_relationship_user1_idx (left_user_id ASC),
    INDEX fk_users_relationship_user2_idx (right_user_id ASC),
    UNIQUE INDEX users_relationship_id_UNIQUE (users_relationship_id ASC),
    UNIQUE INDEX initiator_id_target_id_UNIQUE (left_user_id, right_user_id),
    INDEX fk_users_relationship_users_relationship_type1_idx (users_relationship_type ASC),
    CONSTRAINT fk_users_relationship_user1
        FOREIGN KEY (left_user_id)
            REFERENCES user (user_id)
            ON DELETE CASCADE
            ON UPDATE CASCADE,
    CONSTRAINT fk_users_relationship_user2
        FOREIGN KEY (right_user_id)
            REFERENCES user (user_id)
            ON DELETE CASCADE
            ON UPDATE CASCADE)
    ENGINE = InnoDB;


CREATE TABLE IF NOT EXISTS chat (
    chat_id BINARY(16) NOT NULL,
    creating_date TIMESTAMP NOT NULL,
    name VARCHAR(255) NOT NULL,
    PRIMARY KEY (chat_id),
    UNIQUE INDEX chat_id_UNIQUE (chat_id ASC))
    ENGINE = InnoDB;


CREATE TABLE IF NOT EXISTS chat_has_user (
    chat_has_user_id BINARY(16) NOT NULL,
    chat_id BINARY(16) NOT NULL,
    user_id BINARY(16) NOT NULL,
    INDEX fk_chat_has_user_user1_idx (user_id ASC),
    INDEX fk_chat_has_user_chat1_idx (chat_id ASC),
    PRIMARY KEY (chat_has_user_id),
    UNIQUE INDEX chat_has_user_id_UNIQUE (chat_has_user_id ASC),
    CONSTRAINT fk_chat_has_user_chat1
        FOREIGN KEY (chat_id)
            REFERENCES chat (chat_id)
            ON DELETE CASCADE
            ON UPDATE CASCADE,
    CONSTRAINT fk_chat_has_user_user1
        FOREIGN KEY (user_id)
            REFERENCES user (user_id)
            ON DELETE CASCADE
            ON UPDATE CASCADE)
    ENGINE = InnoDB;


CREATE TABLE IF NOT EXISTS message (
    message_id BINARY(16) NOT NULL,
    addresser_id BINARY(16) NOT NULL,
    chat_id BINARY(16) NOT NULL,
    send_date TIMESTAMP NOT NULL,
    text TEXT NOT NULL,
    PRIMARY KEY (message_id),
    UNIQUE INDEX message_id_UNIQUE (message_id ASC),
    INDEX fk_message_user1_idx (addresser_id ASC),
    INDEX fk_message_chat1_idx (chat_id ASC),
    CONSTRAINT fk_message_user1
        FOREIGN KEY (addresser_id)
            REFERENCES user (user_id)
            ON DELETE CASCADE
            ON UPDATE CASCADE,
    CONSTRAINT fk_message_chat1
        FOREIGN KEY (chat_id)
            REFERENCES chat (chat_id)
            ON DELETE CASCADE
            ON UPDATE CASCADE)
    ENGINE = InnoDB;


CREATE TABLE IF NOT EXISTS message_has_file (
    message_has_file_id BINARY(16) NOT NULL,
    message_id BINARY(16) NOT NULL,
    file_id BINARY(16) NOT NULL,
    INDEX fk_message_has_file_file1_idx (file_id ASC),
    INDEX fk_message_has_file_message1_idx (message_id ASC),
    PRIMARY KEY (message_has_file_id),
    UNIQUE INDEX message_has_file_id_UNIQUE (message_has_file_id ASC),
    CONSTRAINT fk_message_has_file_message1
        FOREIGN KEY (message_id)
            REFERENCES message (message_id)
            ON DELETE NO ACTION
            ON UPDATE NO ACTION,
    CONSTRAINT fk_message_has_file_file1
        FOREIGN KEY (file_id)
            REFERENCES file (file_id)
            ON DELETE NO ACTION
            ON UPDATE NO ACTION)
    ENGINE = InnoDB;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
