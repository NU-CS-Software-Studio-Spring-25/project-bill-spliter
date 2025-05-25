class Api::V1::GroupMembersController < ApplicationController
    skip_before_action :verify_authenticity_token
  
    def create
      group_member = GroupMember.new(group_member_params)
  
      if group_member.save
        render json: {
          group_member: group_member.as_json(
            include: {
              user: { only: [:id, :name, :email] },
              group: { only: [:id, :group_name] }
            }
          ),
          message: "Member added successfully"
        }, status: :created
      else
        render json: { errors: group_member.errors.full_messages }, status: :unprocessable_entity
      end
    end
  
    def bulk_create
      group_id = params[:group_id]
      user_emails = params[:user_emails] || []
  
      if group_id.blank?
        render json: { error: "Group ID is required" }, status: :bad_request
        return
      end
  
      group = Group.find_by(id: group_id)
      unless group
        render json: { error: "Group not found" }, status: :not_found
        return
      end
  
      users = User.where(email: user_emails.reject(&:blank?))
      added_members = []
      errors = []
  
      users.each do |user|
        group_member = group.group_members.build(user: user)
        if group_member.save
          added_members << group_member
        else
          errors << "Failed to add #{user.email}: #{group_member.errors.full_messages.join(', ')}"
        end
      end
  
      render json: {
        added_members: added_members.as_json(
          include: { user: { only: [:id, :name, :email] } }
        ),
        errors: errors,
        message: "#{added_members.count} members added successfully"
      }
    end
  
    def destroy
      group_member = GroupMember.find(params[:id])
      
      # Don't allow removing the group creator
      if group_member.group.creator == group_member.user
        render json: { error: "Cannot remove group creator" }, status: :forbidden
        return
      end
  
      group_member.destroy
      render json: { message: "Member removed successfully" }
    rescue ActiveRecord::RecordNotFound
      render json: { error: "Group member not found" }, status: :not_found
    end
  
    private
  
    def group_member_params
      params.require(:group_member).permit(:group_id, :user_id)
    end
  end