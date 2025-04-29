class Api::V1::GroupsController < ApplicationController
    skip_before_action :verify_authenticity_token
    def index
        groups = Group.all
        render json: groups
    end
    
    def show
        group = Group.find_by(id: params[:id])
        
        if group
            render json: group
        else
            render json: { error: "Group not found" }, status: :not_found
        end
    end

    def create
        group = Group.new(group_params)
        group.member_ids = params[:member_ids] || []
      
        ActiveRecord::Base.transaction do
            if group.save
                group.reload
            # Update each user's group_ids
                group.member_ids.each do |user_id|
                    user = User.find(user_id)
                    user.group_ids << group.id
                    user.group_ids.uniq!  # just in case
                    user.save!
                end
      
                render json: group, status: :created
            else
            render json: { errors: group.errors.full_messages }, status: :unprocessable_entity
            raise ActiveRecord::Rollback
          end
        end
    end
      
    def destroy
        group = Group.find_by(id: params[:id])
      
        if group
            ActiveRecord::Base.transaction do
            # Remove the group ID from all member users
                group.member_ids.each do |user_id|
                    user = User.find_by(id: user_id)
                    if user
                        user.group_ids.delete(group.id)
                        user.save!
                    end
                end
      
                group.destroy!
                render json: { message: "Group deleted successfully" }, status: :ok
            end
        else
            render json: { error: "Group not found" }, status: :not_found
        end
    end
  
    private
  
    def group_params
        params.require(:group).permit(:group_name, :created_by, member_ids: [])
    end
  end