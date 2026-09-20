export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          user_id: string;
          display_name: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          display_name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          display_name?: string | null;
        };
        Relationships: [];
      };
      membership_entitlements: {
        Row: {
          id: string;
          user_id: string;
          enabled: boolean;
          starts_at: string | null;
          expires_at: string | null;
          revoked_at: string | null;
          source: "manual" | "complimentary" | "billing_provider" | "migration";
          source_reference: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          enabled?: boolean;
          starts_at?: string | null;
          expires_at?: string | null;
          revoked_at?: string | null;
          source: "manual" | "complimentary" | "billing_provider" | "migration";
          source_reference?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: never;
        Relationships: [];
      };
      bookmarks: {
        Row: { user_id: string; idea_id: string; saved_at: string };
        Insert: { user_id?: string; idea_id: string; saved_at?: string };
        Update: never;
        Relationships: [];
      };
      projects: {
        Row: {
          id: string;
          user_id: string;
          idea_id: string;
          plan_version: string;
          paused_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: never;
        Update: never;
        Relationships: [];
      };
      project_stages: {
        Row: {
          project_id: string;
          idea_id: string;
          plan_version: string;
          stage_id: string;
          position: number;
          created_at: string;
        };
        Insert: never;
        Update: never;
        Relationships: [];
      };
      project_tasks: {
        Row: {
          project_id: string;
          idea_id: string;
          plan_version: string;
          stage_id: string;
          task_id: string;
          position: number;
          required: boolean;
          completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: never;
        Update: never;
        Relationships: [];
      };
      project_stage_notes: {
        Row: {
          project_id: string;
          idea_id: string;
          plan_version: string;
          stage_id: string;
          content: string;
          revision: number;
          created_at: string;
          updated_at: string;
        };
        Insert: never;
        Update: never;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      start_member_project: { Args: { p_idea_id: string }; Returns: string };
      set_member_project_paused: { Args: { p_project_id: string; p_paused: boolean }; Returns: string | null };
      set_member_project_task_completed: {
        Args: { p_project_id: string; p_stage_id: string; p_task_id: string; p_completed: boolean };
        Returns: string | null;
      };
      save_member_project_stage_note: {
        Args: { p_project_id: string; p_stage_id: string; p_content: string; p_expected_revision: number };
        Returns: Array<{ saved_content: string; saved_revision: number; saved_updated_at: string }>;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
