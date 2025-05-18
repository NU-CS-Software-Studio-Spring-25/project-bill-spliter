class Api::V1::GroupsController < ApplicationController
    skip_before_action :verify_authenticity_token
  
    # GET /api/v1/groups
    def index
      groups = Group.includes(:members).page(params[:page]).per(12)
      render json: {
        groups: groups.as_json(include: :members),
        current_page: groups.current_page,
        total_pages: groups.total_pages
      }
    end
  
    # GET /api/v1/groups/:id
    def show
      group = Group.includes(:members).find_by(id: params[:id])
  
      if group
        render json: group.to_json(include: :members)
      else
        render json: { error: "Group not found" }, status: :not_found
      end
    end
  
    # POST /api/v1/groups
    def create
      group = Group.new(group_name: params[:group_name], created_by: params[:created_by])
  
      emails = params[:member_ids] || []
      users = User.where(email: emails)
  
      ActiveRecord::Base.transaction do
        unless group.save
          puts group.errors.full_messages
        end
        if group.save
          group.members << users
  
          render json: group.to_json(include: :members), status: :created
        else
          render json: { errors: group.errors.full_messages }, status: :unprocessable_entity
          raise ActiveRecord::Rollback
        end
      end
    end
  
    # DELETE /api/v1/groups/:id
    def destroy
      group = Group.find_by(id: params[:id])
  
      if group
        group.destroy!
        render json: { message: "Group deleted successfully" }, status: :ok
      else
        render json: { error: "Group not found" }, status: :not_found
      end
    end
  
    private
  
    # group_params
    def group_params
      params.permit(:group_name, :created_by, member_ids: [])
    end
  end
  