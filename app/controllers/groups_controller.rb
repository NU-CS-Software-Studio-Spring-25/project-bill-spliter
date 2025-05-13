class GroupsController < ApplicationController
    def show
      @group = Group.find(params[:id])
      @members = @group.members
      @expenses = @group.expenses.includes(:added_by_user)
    end
end
