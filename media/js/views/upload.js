/*
 * UPLOAD/FILE VIEWS
 * The king of all views.
 */

'use strict';

Dropzone && (Dropzone.autoDiscover = false);

+function(window, $, _) {

    window.LCB = window.LCB || {};

    window.LCB.UploadView = Backbone.View.extend({
        events: {
            'submit form': 'submit'
        },
        initialize: function(options) {
            this.template = Handlebars.compile($('#template-upload-preview').html());
            this.rooms = options.rooms;
            this.rooms.on('add remove', this.populateRooms, this);
            this.rooms.on('upload:show', this.show, this)
            this.render();
        },
        render: function() {
            //
            // Dropzone
            //
            this.dropzone = new Dropzone(this.$el.closest('.lcb-client').get(0), {
                url: '/files',
                autoProcessQueue: false,
                clickable: [this.$('.lcb-upload-target').get(0)],
                previewsContainer: this.$('.lcb-upload-preview-files').get(0),
                addRemoveLinks: true,
                dictRemoveFile: 'Remove',
                parallelUploads: 8,
                maxFiles: 8
            });
            this.dropzone
                .on('sending', _.bind(this.sending, this))
                .on('sendingmultiple', _.bind(this.sending, this))
                .on('addedfile', _.bind(this.show, this))
                .on('queuecomplete', _.bind(this.complete, this));
            //
            // Modal events
            //
            this.$el.on('hidden.bs.modal', _.bind(this.clear, this));
            this.$el.on('shown.bs.modal', _.bind(this.setRoom, this));
        },
        show: function() {
            this.$el.modal('show');
        },
        hide: function() {
            this.$el.modal('hide');
        },
        clear: function() {
            this.dropzone.removeAllFiles();
        },
        complete: function(e) {
            var remaining = _.some(this.dropzone.files, function(file) {
                return file.status !== 'success'
            });
            if (remaining) {
                swal('Woops!', 'There were some issues uploading your files.', 'warning');
                return;
            }
            this.hide();
            swal('Success', 'Files uploaded!', 'success');
        },
        sending: function(file, xhr, formData) {
            formData.append('room', this.$('select[name="room"]').val());
            formData.append('post', this.$('input[name="post"]').is(':checked'));
        },
        submit: function(e) {
            e.preventDefault();
            if (!this.$('select[name="room"]').val()) {
                swal('Woops!', 'Please specify a room.', 'warning');
                return;
            }
            this.dropzone.processQueue();
        },
        setRoom: function() {
            this.$('select[name="room"]').val(this.rooms.current.id);
        },
        populateRooms: function() {
            var $select = this.$('select[name="room"]').empty();
            this.rooms.each(function(room) {
                var $option = $('<option />');
                $option
                    .attr('value', room.id)
                    .text(room.get('name'))
                    .appendTo($select);
            });
        }
    });

}(window, $, _);