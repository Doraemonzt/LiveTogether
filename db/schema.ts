import {sqliteTable,text,integer,index} from "drizzle-orm/sqlite-core";
export const videos=sqliteTable("videos",{id:text("id").primaryKey(),owner:text("owner").notNull(),sessionId:text("session_id").notNull(),payload:text("payload").notNull(),createdAt:text("created_at").notNull()},t=>[index("videos_session").on(t.sessionId),index("videos_owner").on(t.owner)]);
export const assets=sqliteTable("assets",{id:text("id").primaryKey(),owner:text("owner").notNull(),mime:text("mime").notNull(),size:integer("size").notNull()});
export const interactions=sqliteTable("interactions",{id:text("id").primaryKey(),videoId:text("video_id").notNull(),userId:text("user_id").notNull(),kind:text("kind").notNull(),text:text("text").notNull(),at:integer("at"),status:text("status").notNull(),createdAt:text("created_at").notNull()},t=>[index("interactions_video").on(t.videoId),index("interactions_user").on(t.userId)]);


export const concertSessions=sqliteTable("concert_sessions",{id:text("id").primaryKey(),owner:text("owner").notNull(),payload:text("payload").notNull(),createdAt:text("created_at").notNull()});
