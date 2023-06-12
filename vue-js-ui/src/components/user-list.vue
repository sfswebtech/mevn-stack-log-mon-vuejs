<template>
  <div class="log-viewer">
    <loading
      color="#09b8aa"
      class="loading"
      :active.sync="isLoading"
      :can-cancel="true"
      :is-full-page="fullPage"
    >
    </loading>
    <div
      id="topHeader"
      class="log-report-header row bg-light m-0"
      v-if="currentUser && currentUser.firstName"
    >
      <div class="col-12 d-flex justify-content-between">
        <div class="logo">
          <h1>
            <a href="/#/home"
              ><img src="../../public/assets/log-mon-logo.png"
            /></a>
          </h1>
        </div>
        <div class="d-flex align-items-center label-div">
          <span class="fa fa-user"></span>
          <label
            class="text-capitalize p-2"
            data-toggle="dropdown"
            :title="currentUser.firstName"
          >
            {{
              currentUser.firstName.length > 8
                ? currentUser.firstName.slice(0, 6) + " ..."
                : currentUser.firstName
            }}
          </label>
          <label class="cursor-pointer text-capitalizep-2 pl-1">
            <i class="dropdown-toggle" data-toggle="dropdown"> </i>
            <ul class="dropdown-menu">
              <li class="pl-2 p-1 border-bottom">
                <a href="/#/monitoring-software"
                  ><i class="fa fa-tachometer p-2"></i> Dashboard</a
                >
              </li>
              <li
                class="pl-2 p-1 border-bottom-profile"
                v-if="currentUser.role === 'admin'"
              >
                <a href="/#/user-list"
                  ><i class="fa fa-list p-2"></i>User list</a
                >
              </li>
              <li class="pl-2 p-1 border-bottom">
                <a href="/#/profile"
                  ><i class="fa fa-gear p-2"></i>Profile Setting</a
                >
              </li>
              <li class="pl-2 p-1 border-bottom" v-on:click="logout()">
                <a><i class="fa fa-sign-out p-2"></i> Logout</a>
              </li>
            </ul>
          </label>
        </div>
      </div>
    </div>
    <div class="user-listing-section">
      <div class="add-user-button">
        <div class="user-button">
          <h4>User List</h4>
          <button
            type="button"
            class="add-user"
            v-on:click="showAddEditUserModal()"
          >
            <i class="fa fa-plus pr-1"> </i> Add User
          </button>
        </div>
        <p class="remaining-users text-primary">
          {{ currentUser.adminUsersLimit - userList.length }} Number of user
          remaining
        </p>
      </div>
      <div class="user-table">
        <div class="table-section">
          <table class="table table-bordered">
            <thead>
              <tr>
                <th>Full Name</th>
                <th>Email</th>
                <th>Mobile No</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="!userList.length">
                <td colspan="4" rowspan="2" scope="col">
                  <p class="no-data">No Data Available</p>
                </td>
              </tr>
              <tr v-for="(user, id) in userList" :key="id">
                <td>{{ user.firstName }} {{ user.lastName }}</td>
                <td>{{ user.email }}</td>
                <td>{{ user.phoneNumber }}</td>
                <td>
                  <div class="btn-group">
                    <span v-on:click="showAddEditUserModal(user)">
                      <i class="fa fa-edit"></i>
                    </span>
                    <span
                      data-toggle="modal"
                      v-on:click="showDeleteUserModal(user)"
                    >
                      <i class="fa fa-trash"></i>
                    </span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
    <div
      class="modal fade"
      data-backdrop="static"
      id="addEditUserModal"
      tabindex="-1"
      role="dialog"
      aria-labelledby="myModalLabel"
    >
      <div class="modal-dialog modal-dialog-centered" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="myModalLabel">
              {{ item._id ? "Edit" : "Create" }} User
            </h5>
            <button
              type="button"
              class="close"
              data-dismiss="modal"
              aria-label="Close"
            >
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body">
            <form
              class="login100-form validate-form"
              v-on:submit.prevent="createUser"
            >
              <div class="create-user-fields">
                <div class="form-group">
                  <label
                    >First Name
                    <sup>
                      <i
                        class="fa fa-star star-icon"
                        v-bind:class="{
                          'text-danger': !item.firstName,
                          'text-primary': item.firstName,
                        }"
                        aria-hidden="true"
                      ></i>
                    </sup>
                  </label>
                  <input
                    class="form-control"
                    type="text"
                    name="firstName"
                    placeholder="Type Your First Name"
                    v-model="item.firstName"
                  />
                </div>
                <div class="form-group">
                  <label
                    >Last Name
                    <sup>
                      <i
                        class="fa fa-star star-icon"
                        v-bind:class="{
                          'text-danger': !item.lastName,
                          'text-primary': item.lastName,
                        }"
                        aria-hidden="true"
                      ></i>
                    </sup>
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    placeholder="Type Your Last Name"
                    v-model="item.lastName"
                    class="form-control"
                  />
                </div>
                <div class="form-group">
                  <label
                    >Email
                    <sup>
                      <i
                        class="fa fa-star star-icon"
                        v-bind:class="{
                          'text-danger': !item.email,
                          'text-primary': item.email,
                        }"
                        aria-hidden="true"
                      ></i>
                    </sup>
                  </label>
                  <input
                    type="text"
                    name="email"
                    placeholder="Type your email"
                    v-model="item.email"
                    v-on:keyup="checkEmailAlreadyExists($event)"
                    class="form-control"
                  />
                  <p
                    class="alert mt-1 alert-danger validation-font-size text-left"
                    role="alert"
                    v-if="item.email && alreadyEmailValidation"
                  >
                    This Email Already Exists, please try another one.
                  </p>
                  <p
                    class="alert mt-1 alert-danger validation-font-size text-left"
                    role="alert"
                    v-if="item.email && !validEmail"
                  >
                    Your email address is invalid. Please enter a valid address.
                  </p>
                </div>
                <div class="form-group">
                  <label>
                    Password
                    {{
                      item._id && !item.password && !item.confPassword
                        ? "(Optional)"
                        : ""
                    }}
                    <sup v-if="!item._id || item.password || item.confPassword">
                      <i
                        class="fa fa-star star-icon"
                        v-bind:class="{
                          'text-danger': !item.password,
                          'text-primary': item.password,
                        }"
                        aria-hidden="true"
                      ></i>
                    </sup>
                  </label>
                  <input
                    v-on:keyup="CheckPassword()"
                    type="password"
                    name="password"
                    placeholder="Type Your password"
                    v-model="item.password"
                    class="form-control"
                  />
                  <p
                    class="alert mt-1 alert-danger validation-font-size text-left"
                    role="alert"
                    v-if="item.password && strongPassword == false"
                  >
                    Your password should be minimum 7 and maximum 10 characters
                    with 1 number and 1 special character.
                  </p>
                </div>
                <div class="form-group">
                  <label
                    >Confirm Password
                    {{
                      item._id && !item.password && !item.confPassword
                        ? "(Optional)"
                        : ""
                    }}
                    <sup v-if="!item._id || item.password || item.confPassword">
                      <i
                        class="fa fa-star star-icon"
                        v-bind:class="{
                          'text-danger': !item.confPassword,
                          'text-primary': item.confPassword,
                        }"
                        aria-hidden="true"
                      ></i>
                    </sup>
                  </label>
                  <input
                    type="password"
                    name="confPassword"
                    placeholder="Type Your password"
                    v-model="item.confPassword"
                    class="form-control"
                  />
                </div>
                <div class="form-group">
                  <label
                    >Mobile Number
                    <sup>
                      <i
                        class="fa fa-star star-icon"
                        v-bind:class="{
                          'text-danger': !item.phoneNumber,
                          'text-primary': item.phoneNumber,
                        }"
                        aria-hidden="true"
                      ></i> </sup
                  ></label>
                  <div class="country-selection">
                    <select class="form-control" v-model="item.countrycode">
                      <option value="+91">+91</option>
                      <option value="+44">+44</option>
                    </select>
                    <input
                      maxlength="10"
                      type="text"
                      name="phoneNumber"
                      placeholder="Type your Mobile Number"
                      v-model="item.phoneNumber"
                      class="form-control"
                    />
                  </div>
                </div>
                <div class="form-group">
                  <label>Access Permission</label>
                  <div class="checkbox-label">
                    <div>
                      <input
                        type="checkbox"
                        v-model="item.accessList.logMon"
                        id="logMon"
                        name="logmon"
                      />
                      <label for="logMon">LogMon</label>
                    </div>
                    <div>
                      <input
                        type="checkbox"
                        v-model="item.accessList.threadMon"
                        id="threadMon"
                        name="threadmon"
                      />
                      <label for="threadMon">ThreadMon</label>
                    </div>
                  </div>
                </div>
              </div>
              <div class="button-section">
                <input
                  type="submit"
                  class="btn btn-primary submit-btn"
                  value="Save"
                />
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
    <div
      class="modal fade"
      data-backdrop="static"
      id="deleteUserModal"
      tabindex="-1"
      aria-labelledby="deleteUserModalLabel"
      aria-hidden="true"
    >
      <div class="modal-dialog modal-dialog-centered modal-md">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Delete User</h5>
            <button
              type="button"
              class="close"
              data-dismiss="modal"
              aria-label="Close"
              v-on:click="currentDeleteUser = {}"
            >
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body">
            <p class="modal-para modal-title pb-3">
              Are you sure want to delete this user
              <b>{{ currentDeleteUser.firstName }}</b> ?
            </p>
          </div>
          <div class="modal-footer">
            <button
              type="button"
              class="modal-first-button btn btn-secondary p-2 pl-3 pr-3"
              data-dismiss="modal"
              v-on:click="currentDeleteUser = {}"
            >
              NO
            </button>
            <button
              type="button"
              v-on:click="deleteUserinDb()"
              class="modal-second-button btn btn-default p-2 pl-3 pr-3"
            >
              YES
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script src="./log-report.js"></script>
<style>
canvas {
  width: 95% !important;
  height: 300px !important;
  margin: auto !important;
}
</style>

<script src="./user-list.js"></script>
