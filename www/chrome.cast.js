/**
 * Portions of this page are modifications based on work created and shared by
 * Google and used according to terms described in the Creative Commons 3.0
 * Attribution License.
 */
var EventEmitter = require('cordova-plugin-chromecast.EventEmitter');

var chrome = {};

chrome.cast = {

    /**
     * The API version.
     * @type {Array}
     */
    VERSION: [1, 1],

    /**
     * Describes availability of a Cast receiver.
     * AVAILABLE: At least one receiver is available that is compatible with the session request.
     * UNAVAILABLE: No receivers are available.
     * @type {Object}
     */
    ReceiverAvailability: { AVAILABLE: 'available', UNAVAILABLE: 'unavailable' },

    /**
     * TODO: Update when the official API docs are finished
     * https://developers.google.com/cast/docs/reference/chrome/chrome.cast.ReceiverType
     * CAST:
     * DIAL:
     * CUSTOM:
     * @type {Object}
     */
    ReceiverType: { CAST: 'cast', DIAL: 'dial', CUSTOM: 'custom' },

    /**
     * Describes a sender application platform.
     * CHROME:
     * IOS:
     * ANDROID:
     * @type {Object}
     */
    SenderPlatform: { CHROME: 'chrome', IOS: 'ios', ANDROID: 'android' },

    /**
     * Auto-join policy determines when the SDK will automatically connect a sender application to an existing session after API initialization.
     * ORIGIN_SCOPED: Automatically connects when the session was started with the same appId and the same page origin (regardless of tab).
     * PAGE_SCOPED: No automatic connection.
     * TAB_AND_ORIGIN_SCOPED: Automatically connects when the session was started with the same appId, in the same tab and page origin.
     * @type {Object}
     */
    AutoJoinPolicy: { TAB_AND_ORIGIN_SCOPED: 'tab_and_origin_scoped', ORIGIN_SCOPED: 'origin_scoped', PAGE_SCOPED: 'page_scoped' },

    /**
     * Capabilities that are supported by the receiver device.
     * AUDIO_IN: The receiver supports audio input (microphone).
     * AUDIO_OUT: The receiver supports audio output.
     * VIDEO_IN: The receiver supports video input (camera).
     * VIDEO_OUT: The receiver supports video output.
     * @type {Object}
     */
    Capability: { VIDEO_OUT: 'video_out', AUDIO_OUT: 'audio_out', VIDEO_IN: 'video_in', AUDIO_IN: 'audio_in' },

    /**
     * Default action policy determines when the SDK will automatically create a session after initializing the API. This also controls the default action for the tab in the extension popup.
     * CAST_THIS_TAB: No automatic launch is done after initializing the API, even if the tab is being cast.
     * CREATE_SESSION: If the tab containing the app is being casted when the API initializes, the SDK stops tab casting and automatically launches the app.
     * @type {Object}
     */
    DefaultActionPolicy: { CREATE_SESSION: 'create_session', CAST_THIS_TAB: 'cast_this_tab' },

    /**
     * Errors that may be returned by the SDK.
     * API_NOT_INITIALIZED: The API is not initialized.
     * CANCEL: The operation was canceled by the user.
     * CHANNEL_ERROR: A channel to the receiver is not available.
     * EXTENSION_MISSING: The Cast extension is not available.
     * EXTENSION_NOT_COMPATIBLE: The API script is not compatible with the installed Cast extension.
     * INVALID_PARAMETER: The parameters to the operation were not valid.
     * LOAD_MEDIA_FAILED: Load media failed.
     * RECEIVER_UNAVAILABLE: No receiver was compatible with the session request.
     * SESSION_ERROR: A session could not be created, or a session was invalid.
     * TIMEOUT: The operation timed out.
     * @type {Object}
     */
    ErrorCode: {
        API_NOT_INITIALIZED: 'api_not_initialized',
        CANCEL: 'cancel',
        CHANNEL_ERROR: 'channel_error',
        EXTENSION_MISSING: 'extension_missing',
        EXTENSION_NOT_COMPATIBLE: 'extension_not_compatible',
        INVALID_PARAMETER: 'invalid_parameter',
        LOAD_MEDIA_FAILED: 'load_media_failed',
        RECEIVER_UNAVAILABLE: 'receiver_unavailable',
        SESSION_ERROR: 'session_error',
        TIMEOUT: 'timeout',
        UNKNOWN: 'unknown',
        NOT_IMPLEMENTED: 'not_implemented'
    },

    SessionStatus: { CONNECTED: 'connected', DISCONNECTED: 'disconnected', STOPPED: 'stopped' },

    /**
     * TODO: Update when the official API docs are finished
     * https://developers.google.com/cast/docs/reference/chrome/chrome.cast.timeout
     * @type {Object}
     */
    timeout: {
        requestSession: 10000,
        sendCustomMessage: 3000,
        setReceiverVolume: 3000,
        stopSession: 3000
    },

    /**
     * Flag for clients to check whether the API is loaded.
     * @type {Boolean}
     */
    isAvailable: false,

    /**
     * [ApiConfig description]
     * @param {chrome.cast.SessionRequest}         sessionRequest      Describes the session to launch or the session to connect.
     * @param {function}                         sessionListener     Listener invoked when a session is created or connected by the SDK.
     * @param {function}                         receiverListener    Function invoked when the availability of a Cast receiver that supports the application in sessionRequest is known or changes.
     * @param {chrome.cast.AutoJoinPolicy}         autoJoinPolicy      Determines whether the SDK will automatically connect to a running session after initialization.
     * @param {chrome.cast.DefaultActionPolicy} defaultActionPolicy Requests whether the application should be launched on API initialization when the tab is already being cast.
     */
    ApiConfig: function (sessionRequest, sessionListener, receiverListener, autoJoinPolicy, defaultActionPolicy) {
        this.sessionRequest = sessionRequest;
        this.sessionListener = sessionListener;
        this.receiverListener = receiverListener;
        this.autoJoinPolicy = autoJoinPolicy || chrome.cast.AutoJoinPolicy.TAB_AND_ORIGIN_SCOPED;
        this.defaultActionPolicy = defaultActionPolicy || chrome.cast.DefaultActionPolicy.CREATE_SESSION;
    },

    /**
     * Describes the receiver running an application. Normally, these objects should not be created by the client.
     * @param {string}                         label        An identifier for the receiver that is unique to the browser profile and the origin of the API client.
     * @param {string}                         friendlyName The user given name for the receiver.
     * @param {chrome.cast.Capability[]}     capabilities The capabilities of the receiver, for example audio and video.
     * @param {chrome.cast.Volume}             volume       The current volume of the receiver.
     */
    Receiver: function (label, friendlyName, capabilities, volume) {
        this.label = label;
        this.friendlyName = friendlyName;
        this.capabilities = capabilities || [];
        this.volume = volume || null;
        this.receiverType = chrome.cast.ReceiverType.CAST;
        this.isActiveInput = null;
    },

    /**
     * TODO: Update when the official API docs are finished
     * https://developers.google.com/cast/docs/reference/chrome/chrome.cast.DialRequest
     * @param {[type]} appName         [description]
     * @param {[type]} launchParameter [description]
     */
    DialRequest: function (appName, launchParameter) {
        this.appName = appName;
        this.launchParameter = launchParameter;
    },

    /**
     * A request to start or connect to a session.
     * @param {string}                         appId        The receiver application id.
     * @param {chrome.cast.Capability[]}     capabilities Capabilities required of the receiver device.
     * @property {chrome.cast.DialRequest}     dialRequest If given, the SDK will also discover DIAL devices that support the DIAL application given in the dialRequest.
     */
    SessionRequest: function (appId, capabilities) {
        this.appId = appId;
        this.capabilities = capabilities || [chrome.cast.Capability.VIDEO_OUT, chrome.cast.Capability.AUDIO_OUT];
        this.dialRequest = null;
    },

    /**
     * Describes an error returned by the API. Normally, these objects should not be created by the client.
     * @param {chrome.cast.ErrorCode}     code        The error code.
     * @param {string}                     description Human readable description of the error.
     * @param {Object}                     details     Details specific to the error.
     */
    Error: function (code, description, details) {
        this.code = code;
        this.description = description || null;
        this.details = details || null;
    },

    /**
     * An image that describes a receiver application or media item. This could be an application icon, cover art, or a thumbnail.
     * @param {string}         url     The URL to the image.
     * @property {number}     height     The height of the image
     * @property {number}     width     The width of the image
     */
    Image: function (url) {
        this.url = url;
        this.width = this.height = null;
    },

    /**
     * Describes a sender application. Normally, these objects should not be created by the client.
     * @param {chrome.cast.SenderPlatform}     platform     The supported platform.
     * @property {string}                     packageId     The identifier or URL for the application in the respective platform's app store.
     * @property {string}                     url         URL or intent to launch the application.
     */
    SenderApplication: function (platform) {
        this.platform = platform;
        this.packageId = this.url = null;
    },

    /**
     * The volume of a device or media stream.
     * @param {number}     level     The current volume level as a value between 0.0 and 1.0.
     * @param {boolean} muted     Whether the receiver is muted, independent of the volume level.
     */
    Volume: function (level, muted) {
        this.level = level;
        if (muted || muted === false) {
            this.muted = !!muted;
        }
    },

    // media package
    media: {
        /**
        * The default receiver app.
        */
        DEFAULT_MEDIA_RECEIVER_APP_ID: 'CC1AD845',

        /**
         * Possible states of the media player.
         * BUFFERING: Player is in PLAY mode but not actively playing content. currentTime will not change.
         * IDLE: No media is loaded into the player.
         * PAUSED: The media is not playing.
         * PLAYING: The media is playing.
         * @type {Object}
         */
        PlayerState: { IDLE: 'IDLE', PLAYING: 'PLAYING', PAUSED: 'PAUSED', BUFFERING: 'BUFFERING' },

        /**
         * States of the media player after resuming.
         * PLAYBACK_PAUSE: Force media to pause.
         * PLAYBACK_START: Force media to start.
         * @type {Object}
         */
        ResumeState: { PLAYBACK_START: 'PLAYBACK_START', PLAYBACK_PAUSE: 'PLAYBACK_PAUSE' },

        /**
         * Possible media commands supported by the receiver application.
         * @type {Object}
         */
        MediaCommand: { PAUSE: 'pause', SEEK: 'seek', STREAM_VOLUME: 'stream_volume', STREAM_MUTE: 'stream_mute' },

        /**
         * Possible types of media metadata.
         * GENERIC: Generic template suitable for most media types. Used by chrome.cast.media.GenericMediaMetadata.
         * MOVIE: A full length movie. Used by chrome.cast.media.MovieMediaMetadata.
         * MUSIC_TRACK: A music track. Used by chrome.cast.media.MusicTrackMediaMetadata.
         * PHOTO: Photo. Used by chrome.cast.media.PhotoMediaMetadata.
         * TV_SHOW: An episode of a TV series. Used by chrome.cast.media.TvShowMediaMetadata.
         * @type {Object}
         */
        MetadataType: { GENERIC: 0, TV_SHOW: 1, MOVIE: 2, MUSIC_TRACK: 3, PHOTO: 4 },

        /**
         * Possible media stream types.
         * BUFFERED: Stored media streamed from an existing data store.
         * LIVE: Live media generated on the fly.
         * OTHER: None of the above.
         * @type {Object}
         */
        StreamType: { BUFFERED: 'buffered', LIVE: 'live', OTHER: 'other' },

        /**
         * TODO: Update when the official API docs are finished
         * https://developers.google.com/cast/docs/reference/chrome/chrome.cast.media.timeout
         * @type {Object}
         */
        timeout: {
            load: 0,
            ob: 0,
            pause: 0,
            play: 0,
            seek: 0,
            setVolume: 0,
            stop: 0
        },

        /**
         * A request to load new media into the player.
         * @param {chrome.cast.media.MediaInfo}     media         Media description.
         * @property {boolean}                         autoplay     Whether the media will automatically play.
         * @property {number}                         currentTime Seconds from the beginning of the media to start playback.
         * @property {Object}                         customData     Custom data for the receiver application.
         */
        LoadRequest: function LoadRequest (media) {
            this.type = 'LOAD';
            this.sessionId = this.requestId = this.customData = this.currentTime = null;
            this.media = media;
            this.autoplay = !0;
        },

        /**
         * A request to play the currently paused media.
         * @property {Object} customData Custom data for the receiver application.
         */
        PlayRequest: function PlayRequest () {
            this.customData = null;
        },

        /**
         * A request to seek the current media.
         * @property {number}                          currentTime The new current time for the media, in seconds after the start of the media.
         * @property {chrome.cast.media.ResumeState} resumeState The desired media player state after the seek is complete.
         * @property {Object}                          customData Custom data for the receiver application.
         */
        SeekRequest: function SeekRequest () {
            this.customData = this.resumeState = this.currentTime = null;
        },

        /**
         * A request to set the stream volume of the playing media.
         * @param {chrome.cast.Volume} volume The new volume of the stream.
         * @property {Object} customData Custom data for the receiver application.
         */
        VolumeRequest: function VolumeRequest (volume) {
            this.volume = volume;
            this.customData = null;
        },

        /**
         * A request to stop the media player.
         * @property {Object} customData Custom data for the receiver application.
         */
        StopRequest: function StopRequest () {
            this.customData = null;
        },

        /**
         * A request to pause the currently playing media.
         * @property {Object} customData Custom data for the receiver application.
         */
        PauseRequest: function PauseRequest () {
            this.customData = null;
        },

        /**
         * A generic media description.
         * @property {chrome.cast.Image[]}                 images         Content images.
         * @property {string}                             releaseDate ISO 8601 date and/or time when the content was released, e.g.
         * @property {number}                             releaseYear Integer year when the content was released.
         * @property {string}                             subtitle     Content subtitle.
         * @property {string}                             title         Content title.
         * @property {chrome.cast.media.MetadataType}     type         The type of metadata.
         */
        GenericMediaMetadata: function GenericMediaMetadata () {
            this.metadataType = this.type = chrome.cast.media.MetadataType.GENERIC;
            this.releaseDate = this.releaseYear = this.images = this.subtitle = this.title = null;
        },

        /**
         * A movie media description.
         * @property {chrome.cast.Image[]}                 images         Content images.
         * @property {string}                             releaseDate ISO 8601 date and/or time when the content was released, e.g.
         * @property {number}                             releaseYear Integer year when the content was released.
         * @property {string}                             studio         Movie studio
         * @property {string}                             subtitle     Content subtitle.
         * @property {string}                             title         Content title.
         * @property {chrome.cast.media.MetadataType}     type         The type of metadata.
         */
        MovieMediaMetadata: function MovieMediaMetadata () {
            this.metadataType = this.type = chrome.cast.media.MetadataType.MOVIE;
            this.releaseDate = this.releaseYear = this.images = this.subtitle = this.studio = this.title = null;
        },

        /**
         * A music track media description.
         * @property {string}                             albumArtist    Album artist name.
         * @property {string}                             albumName    Album name.
         * @property {string}                             artist        Track artist name.
         * @property {string}                             artistName    Track artist name.
         * @property {string}                             composer    Track composer name.
         * @property {number}                             discNumber    Disc number.
         * @property {chrome.cast.Image[]}                 images        Content images.
         * @property {string}                             releaseDate    ISO 8601 date when the track was released, e.g.
         * @property {number}                             releaseYear    Integer year when the album was released.
         * @property {string}                             songName    Track name.
         * @property {string}                             title        Track title.
         * @property {number}                             trackNumber    Track number in album.
         * @property {chrome.cast.media.MetadataType}     type         The type of metadata.
         */
        MusicTrackMediaMetadata: function MusicTrackMediaMetadata () {
            this.metadataType = this.type = chrome.cast.media.MetadataType.MUSIC_TRACK;
            this.releaseDate = this.releaseYear = this.images = this.discNumber = this.trackNumber = this.artistName = this.songName = this.composer = this.artist = this.albumArtist = this.title = this.albumName = null;
        },

        /**
         * A photo media description.
         * @property {string}                             artist                 Name of the photographer.
         * @property {string}                             creationDateTime     ISO 8601 date and time the photo was taken, e.g.
         * @property {number}                             height                 Photo height, in pixels.
         * @property {chrome.cast.Image[]}                 images                 Images associated with the content.
         * @property {number}                             latitude             Latitude.
         * @property {string}                             location             Location where the photo was taken.
         * @property {number}                             longitude             Longitude.
         * @property {string}                             title                 Photo title.
         * @property {chrome.cast.media.MetadataType}     type                 The type of metadata.
         * @property {number}                             width                 Photo width, in pixels.
         */
        PhotoMediaMetadata: function PhotoMediaMetadata () {
            this.metadataType = this.type = chrome.cast.media.MetadataType.PHOTO;
            this.creationDateTime = this.height = this.width = this.longitude = this.latitude = this.images = this.location = this.artist = this.title = null;
        },

        /**
         * [TvShowMediaMetadata description]
         * @property {number}                             episode         TV episode number.
         * @property {number}                             episodeNumber     TV episode number.
         * @property {string}                             episodeTitle     TV episode title.
         * @property {chrome.cast.Image[]}                 images             Content images.
         * @property {string}                             originalAirdate ISO 8601 date when the episode originally aired, e.g.
         * @property {number}                             releaseYear     Integer year when the content was released.
         * @property {number}                             season             TV episode season.
         * @property {number}                             seasonNumber     TV episode season.
         * @property {string}                             seriesTitle     TV series title.
         * @property {string}                             title             TV episode title.
         * @property {chrome.cast.media.MetadataType}     type             The type of metadata.
         */
        TvShowMediaMetadata: function TvShowMediaMetadata () {
            this.metadataType = this.type = chrome.cast.media.MetadataType.TV_SHOW;
            this.originalAirdate = this.releaseYear = this.images = this.episode = this.episodeNumber = this.season = this.seasonNumber = this.episodeTitle = this.title = this.seriesTitle = null;
        },

        /**
         * Describes a media item.
         * @param {string}                             contentId   Identifies the content.
         * @param {string}                             contentType MIME content type of the media.
         * @property {Object}                         customData     Custom data set by the receiver application.
         * @property {number}                         duration     Duration of the content, in seconds.
         * @property {any type}                     metadata     Describes the media content.
         * @property {chrome.cast.media.StreamType} streamType     The type of media stream.
         */
        MediaInfo: function MediaInfo (contentId, contentType) {
            this.contentId = contentId;
            this.streamType = chrome.cast.media.StreamType.BUFFERED;
            this.contentType = contentType;
            this.customData = this.duration = this.metadata = null;
        },

        /**
         * Possible media track types.
         */
        TrackType: {TEXT: 'TEXT', AUDIO: 'AUDIO', VIDEO: 'VIDEO'},

        /**
         * Possible text track types.
         */
        TextTrackType: {SUBTITLES: 'SUBTITLES', CAPTIONS: 'CAPTIONS', DESCRIPTIONS: 'DESCRIPTIONS', CHAPTERS: 'CHAPTERS', METADATA: 'METADATA'},

        /**
         * Describes track metadata information
         * @param {number}                                            trackId Unique identifier of the track within the context of a chrome.cast.media.MediaInfo objects
         * @param {chrome.cast.media.TrackType}    trackType The type of track. Value must not be null.
         */
        Track: function Track (trackId, trackType) {
            this.trackId = trackId;
            this.type = trackType;
            this.customData = this.language = this.name = this.subtype = this.trackContentId = this.trackContentType = null;
        },

         /**
          * Possible text track edge types.
          */
        TextTrackEdgeType: {NONE: 'NONE', OUTLINE: 'OUTLINE', DROP_SHADOW: 'DROP_SHADOW', RAISED: 'RAISED', DEPRESSED: 'DEPRESSED'},

        /**
         * Possible text track font generic family.
         */
        TextTrackFontGenericFamily: {
            CURSIVE: 'CURSIVE',
            MONOSPACED_SANS_SERIF: 'MONOSPACED_SANS_SERIF',
            MONOSPACED_SERIF: 'MONOSPACED_SERIF',
            SANS_SERIF: 'SANS_SERIF',
            SERIF: 'SERIF',
            SMALL_CAPITALS: 'SMALL_CAPITALS'
        },

         /**
          * Possible text track font style.
          */
        TextTrackFontStyle: {NORMAL: 'NORMAL', BOLD: 'BOLD', BOLD_ITALIC: 'BOLD_ITALIC', ITALIC: 'ITALIC'},

         /**
          * Possible text track window types.
          */
        TextTrackWindowType: {NONE: 'NONE', NORMAL: 'NORMAL', ROUNDED_CORNERS: 'ROUNDED_CORNERS'},

         /**
         * Describes style information for a text track.
         *
         * Colors are represented as strings "#RRGGBBAA" where XX are the two hexadecimal symbols that represent
         * the 0-255 value for the specific channel/color. It follows CSS 8-digit hex color notation (See
         * http://dev.w3.org/csswg/css-color/#hex-notation).
         */
        TextTrackStyle: function TextTrackStyle () {
            this.backgroundColor = this.customData = this.edgeColor = this.edgeType =
            this.fontFamily = this.fontGenericFamily = this.fontScale = this.fontStyle =
            this.foregroundColor = this.windowColor = this.windowRoundedCornerRadius =
            this.windowType = null;
        },

         /**
         * A request to modify the text tracks style or change the tracks status. If a trackId does not match
         * the existing trackIds the whole request will fail and no status will change. It is acceptable to
         * change the text track style even if no text track is currently active.
         * @param {number[]}                            opt_activeTrackIds Optional.
         * @param {chrome.cast.media.TextTrackStyle}    opt_textTrackSytle Optional.
         **/
        EditTracksInfoRequest: function EditTracksInfoRequest (opt_activeTrackIds, opt_textTrackSytle) {
            this.activeTrackIds = opt_activeTrackIds;
            this.textTrackSytle = opt_textTrackSytle;
            this.requestId = null;
        }
    }
};

var _sessionListener = function () {};
var _receiverListener = function () {};

var _session;
var _currentMedia = null;

/**
 * Initializes the API. Note that either successCallback and errorCallback will be invoked once the API has finished initialization.
 * The sessionListener and receiverListener may be invoked at any time afterwards, and possibly more than once.
 * @param  {chrome.cast.ApiConfig} apiConfig       The object with parameters to initialize the API. Must not be null.
 * @param  {function} successCallback
 * @param  {function} errorCallback
 */
chrome.cast.initialize = function (apiConfig, successCallback, errorCallback) {
    if (!chrome.cast.isAvailable) {
        errorCallback(new chrome.cast.Error(chrome.cast.ErrorCode.API_NOT_INITIALIZED), 'The API is not initialized.', {});
        return;
    }

    execute('initialize', apiConfig.sessionRequest.appId, apiConfig.autoJoinPolicy, apiConfig.defaultActionPolicy, function (err) {
        if (!err) {
            // Don't set the listeners config until success
            _sessionListener = apiConfig.sessionListener;
            _receiverListener = apiConfig.receiverListener;

            successCallback();
            chrome.cast._.receiverUpdate(false);
        } else {
            handleError(err, errorCallback);
        }
    });
};

/**
 * Requests that a receiver application session be created or joined.
 * By default, the SessionRequest passed to the API at initialization time is used;
 *     this may be overridden by passing a different session request in opt_sessionRequest.
 * @param  {function}                     successCallback
 * @param  {function}                     errorCallback      The possible errors are TIMEOUT, INVALID_PARAMETER, API_NOT_INITIALIZED, CANCEL, CHANNEL_ERROR, SESSION_ERROR, RECEIVER_UNAVAILABLE, and EXTENSION_MISSING. Note that the timeout timer starts after users select a receiver. Selecting a receiver requires user's action, which has no timeout.
 * @param  {chrome.cast.SessionRequest} opt_sessionRequest
 */
chrome.cast.requestSession = function (successCallback, errorCallback, opt_sessionRequest) {
    if (chrome.cast.isAvailable === false) {
        errorCallback(new chrome.cast.Error(chrome.cast.ErrorCode.API_NOT_INITIALIZED), 'The API is not initialized.', {});
        return;
    }

    execute('requestSession', function (err, obj) {
        if (!err) {
            successCallback(updateSession(obj));
        } else {
            handleError(err, errorCallback);
        }
    });
};

/**
 * Sets custom receiver list
 * @param {chrome.cast.Receiver[]}     receivers       The new list. Must not be null.
 * @param {function}                 successCallback
 * @param {function}                 errorCallback
 */
chrome.cast.setCustomReceivers = function (receivers, successCallback, errorCallback) {
    // TODO: Implement
};

/**
 * Describes the state of a currently running Cast application. Normally, these objects should not be created by the client.
 * @param {string}                                 sessionId   Uniquely identifies this instance of the receiver application.
 * @param {string}                                 appId       The identifer of the Cast application.
 * @param {string}                                 displayName The human-readable name of the Cast application, for example, "YouTube".
 * @param {chrome.cast.Image[]}                 appImages   Array of images available describing the application.
 * @param {chrome.cast.Receiver}                 receiver    The receiver that is running the application.
 *
 * @property {Object}                             customData     Custom data set by the receiver application.
 * @property {chrome.cast.media.Media}             media         The media that belong to this Cast session, including those loaded by other senders.
 * @property {Object[]}                         namespaces     A list of the namespaces supported by the receiver application.
 * @property {chrome.cast.SenderApplication}     senderApps     The sender applications supported by the receiver application.
 * @property {string}                            statusText     Descriptive text for the current application content, for example “My Wedding Slideshow”.
 */
chrome.cast.Session = function Session (sessionId, appId, displayName, appImages, receiver) {
    EventEmitter.call(this);
    this.sessionId = sessionId;
    this.appId = appId;
    this.displayName = displayName;
    this.appImages = appImages || [];
    this.receiver = receiver;
    this.media = [];
    this.status = chrome.cast.SessionStatus.CONNECTED;
};

chrome.cast.Session.prototype = Object.create(EventEmitter.prototype);

/**
 * Sets the receiver volume.
 * @param {number}         newLevel        The new volume level between 0.0 and 1.0.
 * @param {function}     successCallback
 * @param {function}     errorCallback   The possible errors are TIMEOUT, API_NOT_INITIALIZED, INVALID_PARAMETER, CHANNEL_ERROR, and EXTENSION_MISSING.
 */
chrome.cast.Session.prototype.setReceiverVolumeLevel = function (newLevel, successCallback, errorCallback) {
    if (chrome.cast.isAvailable === false) {
        errorCallback(new chrome.cast.Error(chrome.cast.ErrorCode.API_NOT_INITIALIZED), 'The API is not initialized.', {});
        return;
    }

    execute('setReceiverVolumeLevel', newLevel, function (err) {
        if (!err) {
            successCallback && successCallback();
        } else {
            handleError(err, errorCallback);
        }
    });
};

/**
 * Sets the receiver volume.
 * @param {boolean} muted                 The new muted status.
 * @param {function} successCallback
 * @param {function} errorCallback       The possible errors are TIMEOUT, API_NOT_INITIALIZED, INVALID_PARAMETER, CHANNEL_ERROR, and EXTENSION_MISSING.
 */
chrome.cast.Session.prototype.setReceiverMuted = function (muted, successCallback, errorCallback) {
    if (chrome.cast.isAvailable === false) {
        errorCallback(new chrome.cast.Error(chrome.cast.ErrorCode.API_NOT_INITIALIZED), 'The API is not initialized.', {});
        return;
    }
    execute('setReceiverMuted', muted, function (err) {
        if (!err) {
            successCallback && successCallback();
        } else {
            handleError(err, errorCallback);
        }
    });
};

/**
 * Stops the running receiver application associated with the session.
 * @param {function} successCallback
 * @param {function} errorCallback   The possible errors are TIMEOUT, API_NOT_INITIALIZED, CHANNEL_ERROR, and EXTENSION_MISSING.
 */
chrome.cast.Session.prototype.stop = function (successCallback, errorCallback) {
    if (chrome.cast.isAvailable === false) {
        errorCallback(new chrome.cast.Error(chrome.cast.ErrorCode.API_NOT_INITIALIZED), 'The API is not initialized.', {});
        return;
    }
    if (this.status !== chrome.cast.SessionStatus.CONNECTED) {
        errorCallback(new chrome.cast.Error(chrome.cast.Error.INVALID_PARAMETER, 'No active session', null));
        return;
    }
    execute('sessionStop', function (err) {
        if (!err) {
            successCallback && successCallback();
        } else {
            if (err === chrome.cast.ErrorCode.INVALID_PARAMETER) {
                errorCallback(new chrome.cast.Error(chrome.cast.Error.INVALID_PARAMETER, 'No active session', null));
                return;
            }
            handleError(err, errorCallback);
        }
    });
};

/**
 * Leaves the current session.
 * @param {function} successCallback
 * @param {function} errorCallback   The possible errors are TIMEOUT, API_NOT_INITIALIZED, CHANNEL_ERROR, and EXTENSION_MISSING.
 */
chrome.cast.Session.prototype.leave = function (successCallback, errorCallback) {
    if (chrome.cast.isAvailable === false) {
        errorCallback(new chrome.cast.Error(chrome.cast.ErrorCode.API_NOT_INITIALIZED), 'The API is not initialized.', {});
        return;
    }
    if (this.status !== chrome.cast.SessionStatus.CONNECTED) {
        errorCallback(new chrome.cast.Error(chrome.cast.Error.INVALID_PARAMETER, 'No active session', null));
        return;
    }
    execute('sessionLeave', function (err) {
        if (!err) {
            successCallback && successCallback();
        } else {
            if (err === chrome.cast.ErrorCode.INVALID_PARAMETER) {
                errorCallback(new chrome.cast.Error(chrome.cast.Error.INVALID_PARAMETER, 'No active session', null));
                return;
            }
            handleError(err, errorCallback);
        }
    });
};

/**
 * Sends a message to the receiver application on the given namespace.
 * The successCallback is invoked when the message has been submitted to the messaging channel.
 * Delivery to the receiver application is best effort and not guaranteed.
 * @param  {string}             namespace
 * @param  {Object or string}     message         Must not be null
 * @param  {[type]}             successCallback Invoked when the message has been sent. Must not be null.
 * @param  {[type]}             errorCallback   Invoked on error. The possible errors are TIMEOUT, API_NOT_INITIALIZED, INVALID_PARAMETER, CHANNEL_ERROR, SESSION_ERROR, and EXTENSION_MISSING
 */
chrome.cast.Session.prototype.sendMessage = function (namespace, message, successCallback, errorCallback) {
    if (chrome.cast.isAvailable === false) {
        errorCallback(new chrome.cast.Error(chrome.cast.ErrorCode.API_NOT_INITIALIZED), 'The API is not initialized.', {});
        return;
    }

    if (typeof message === 'object') {
        message = JSON.stringify(message);
    }
    execute('sendMessage', namespace, message, function (err) {
        if (!err) {
            successCallback && successCallback();
        } else {
            handleError(err, errorCallback);
        }
    });
};

/**
 * Request to load media. Must not be null.
 * @param  {chrome.cast.media.LoadRequest} loadRequest     Request to load media. Must not be null.
 * @param  {function} successCallback Invoked with the loaded Media on success.
 * @param  {function} errorCallback   Invoked on error. The possible errors are TIMEOUT, API_NOT_INITIALIZED, INVALID_PARAMETER, CHANNEL_ERROR, SESSION_ERROR, and EXTENSION_MISSING.
 */
chrome.cast.Session.prototype.loadMedia = function (loadRequest, successCallback, errorCallback) {
    if (chrome.cast.isAvailable === false) {
        errorCallback(new chrome.cast.Error(chrome.cast.ErrorCode.API_NOT_INITIALIZED), 'The API is not initialized.', {});
        return;
    }

    var self = this;

    var mediaInfo = loadRequest.media;
    execute('loadMedia', mediaInfo.contentId, mediaInfo.customData || {}, mediaInfo.contentType, mediaInfo.duration || 0.0, mediaInfo.streamType, loadRequest.autoplay || false, loadRequest.currentTime || 0, mediaInfo.metadata || {}, mediaInfo.textTrackSytle || {}, function (err, obj) {
        if (!err) {
            _currentMedia = new chrome.cast.media.Media(self.sessionId, obj.mediaSessionId);
            _currentMedia.activeTrackIds = obj.activeTrackIds;
            _currentMedia.currentItemId = obj.currentItemId;
            _currentMedia.idleReason = obj.idleReason;
            _currentMedia.loadingItemId = obj.loadingItemId;
            _currentMedia.media = mediaInfo;
            _currentMedia.media.duration = obj.media.duration;
            _currentMedia.media.tracks = obj.media.tracks;
            _currentMedia.media.customData = obj.media.customData || null;
            _currentMedia.currentTime = obj.currentTime;
            _currentMedia.playbackRate = obj.playbackRate;
            _currentMedia.preloadedItemId = obj.preloadedItemId;
            _currentMedia.volume = new chrome.cast.Volume(obj.volume.level, obj.volume.muted);

            _currentMedia.media.tracks = [];

            var track;
            for (var i = 0; i < obj.media.tracks.length; i++) {
                track = obj.media.tracks[i];
                var newTrack = new chrome.cast.media.Track(track.trackId, track.type);
                newTrack.customData = track.customData || null;
                newTrack.language = track.language || null;
                newTrack.name = track.name || null;
                newTrack.subtype = track.subtype || null;
                newTrack.trackContentId = track.trackContentId || null;
                newTrack.trackContentType = track.trackContentType || null;

                _currentMedia.media.tracks.push(newTrack);
            }

            successCallback(_currentMedia);

        } else {
            handleError(err, errorCallback);
        }
    });
};

/**
 * Adds a listener that is invoked when the Session has changed.
 * Changes to the following properties will trigger the listener:
 *     statusText, namespaces, status, and the volume of the receiver.
 *
 * Listeners should check the status property of the Session to
 * determine its connection status. The boolean parameter isAlive is
 * deprecated in favor of the status Session property. The isAlive
 * parameter is still passed in for backwards compatibility, and is
 * true unless status = chrome.cast.SessionStatus.STOPPED.
 * @param {function} listener The listener to add.
 */
chrome.cast.Session.prototype.addUpdateListener = function (listener) {
    this.on('_sessionUpdated', listener);
};

/**
 * Removes a previously added listener for this Session.
 * @param  {function} listener The listener to remove.
 */
chrome.cast.Session.prototype.removeUpdateListener = function (listener) {
    this.removeListener('_sessionUpdated', listener);
};

/**
 * Adds a listener that is invoked when a message is received from the receiver application.
 * The listener is invoked with the the namespace as the first argument and the message as the second argument.
 * @param {string} namespace The namespace to listen on.
 * @param {function} listener  The listener to add.
 */
chrome.cast.Session.prototype.addMessageListener = function (namespace, listener) {
    execute('addMessageListener', namespace);
    this.on('message:' + namespace, listener);
};

/**
 * Removes a previously added listener for messages.
 * @param  {string} namespace The namespace that is listened to.
 * @param  {function} listener  The listener to remove.
 */
chrome.cast.Session.prototype.removeMessageListener = function (namespace, listener) {
    this.removeListener('message:' + namespace, listener);
};

/**
 * Adds a listener that is invoked when a media session is created by another sender.
 * @param {function} listener The listener to add.
 */
chrome.cast.Session.prototype.addMediaListener = function (listener) {
    this.on('_mediaListener', listener);
};

/**
 * Removes a listener that was previously added with addMediaListener.
 * @param  {function} listener The listener to remove.
 */
chrome.cast.Session.prototype.removeMediaListener = function (listener) {
    this.removeListener('_mediaListener', listener);
};

chrome.cast.Session.prototype._update = function (obj) {
    var isAlive = (obj.status !== chrome.cast.SessionStatus.STOPPED);
    this.status = obj.status || this.status;
    this.appId = obj.appId;
    this.appImages = obj.appImages;
    this.displayName = obj.displayName;

    if (obj.receiver) {
        if (!this.receiver) {
            this.receiver = new chrome.cast.Receiver(null, null, null, null);
        }
        this.receiver.friendlyName = obj.receiver.friendlyName;
        this.receiver.label = obj.receiver.label;

        if (obj.receiver.volume) {
            this.receiver.volume = new chrome.cast.Volume(obj.receiver.volume.level, obj.receiver.volume.muted);
        }
    } else {
        this.receiver = null;
    }

    this.emit('_sessionUpdated', isAlive);
};

/**
 * Represents a media item that has been loaded into the receiver application.
 * @param {string} sessionId      Identifies the session that is hosting the media.
 * @param {number} mediaSessionId Identifies the media item.
 *
 * @property {Object}                             customData         Custom data set by the receiver application.
 * @property {number}                             currentTime     The current playback position in seconds since the start of the media.
 * @property {chrome.cast.media.MediaInfo}         media             Media description.
 * @property {number}                            playbackRate     The playback rate.
 * @property {chrome.cast.media.PlayerState}     playerState     The player state.
 * @property {chrome.cast.media.MediaCommand[]} supportedMediaCommands The media commands supported by the media player.
 * @property {chrome.cast.Volume}                 volume             The media stream volume.
 * @property {string}                             idleReason         Reason for idling
 */
chrome.cast.media.Media = function Media (sessionId, mediaSessionId) {
    EventEmitter.call(this);
    this.sessionId = sessionId;
    this.mediaSessionId = mediaSessionId;
    this.currentTime = 0;
    this.playbackRate = 1;
    this.playerState = chrome.cast.media.PlayerState.BUFFERING;
    this.supportedMediaCommands = [
        chrome.cast.media.MediaCommand.PAUSE,
        chrome.cast.media.MediaCommand.SEEK,
        chrome.cast.media.MediaCommand.STREAM_VOLUME,
        chrome.cast.media.MediaCommand.STREAM_MUTE
    ];
    this.volume = new chrome.cast.Volume(1, false);
    this._lastUpdatedTime = Date.now();
    this.media = {};
};

chrome.cast.media.Media.prototype = Object.create(EventEmitter.prototype);

/**
 * Plays the media item.
 * @param  {chrome.cast.media.PlayRequest}     playRequest     The optional media play request.
 * @param  {function}                         successCallback Invoked on success.
 * @param  {function}                         errorCallback   Invoked on error. The possible errors are TIMEOUT, API_NOT_INITIALIZED, INVALID_PARAMETER, CHANNEL_ERROR, SESSION_ERROR, and EXTENSION_MISSING.
 */
chrome.cast.media.Media.prototype.play = function (playRequest, successCallback, errorCallback) {
    if (chrome.cast.isAvailable === false) {
        errorCallback(new chrome.cast.Error(chrome.cast.ErrorCode.API_NOT_INITIALIZED), 'The API is not initialized.', {});
        return;
    }

    execute('mediaPlay', function (err) {
        if (!err) {
            successCallback && successCallback();
        } else {
            handleError(err, errorCallback);
        }
    });
};

/**
 * Pauses the media item.
 * @param  {chrome.cast.media.PauseRequest} pauseRequest     The optional media pause request.
 * @param  {function}                         successCallback Invoked on success.
 * @param  {function}                         errorCallback   Invoked on error. The possible errors are TIMEOUT, API_NOT_INITIALIZED, INVALID_PARAMETER, CHANNEL_ERROR, SESSION_ERROR, and EXTENSION_MISSING.
 */
chrome.cast.media.Media.prototype.pause = function (pauseRequest, successCallback, errorCallback) {
    if (chrome.cast.isAvailable === false) {
        errorCallback(new chrome.cast.Error(chrome.cast.ErrorCode.API_NOT_INITIALIZED), 'The API is not initialized.', {});
        return;
    }

    execute('mediaPause', function (err) {
        if (!err) {
            successCallback && successCallback();
        } else {
            handleError(err, errorCallback);
        }
    });
};

/**
 * Seeks the media item.
 * @param  {chrome.cast.media.SeekRequest}     seekRequest     The media seek request. Must not be null.
 * @param  {function}                         successCallback Invoked on success.
 * @param  {function}                         errorCallback   Invoked on error. The possible errors are TIMEOUT, API_NOT_INITIALIZED, INVALID_PARAMETER, CHANNEL_ERROR, SESSION_ERROR, and EXTENSION_MISSING.
 */
chrome.cast.media.Media.prototype.seek = function (seekRequest, successCallback, errorCallback) {
    if (chrome.cast.isAvailable === false) {
        errorCallback(new chrome.cast.Error(chrome.cast.ErrorCode.API_NOT_INITIALIZED), 'The API is not initialized.', {});
        return;
    }

    const currentTime = Math.round(seekRequest.currentTime);
    const resumeState = seekRequest.resumeState || '';

    execute('mediaSeek', currentTime, resumeState, function (err) {
        if (!err) {
            successCallback && successCallback();
        } else {
            handleError(err, errorCallback);
        }
    });
};

/**
 * Stops the media player.
 * @param  {chrome.cast.media.StopRequest}     stopRequest     The media stop request.
 * @param  {function}                         successCallback Invoked on success.
 * @param  {function}                         errorCallback   Invoked on error. The possible errors are TIMEOUT, API_NOT_INITIALIZED, INVALID_PARAMETER, CHANNEL_ERROR, SESSION_ERROR, and EXTENSION_MISSING.
 */
chrome.cast.media.Media.prototype.stop = function (stopRequest, successCallback, errorCallback) {
    if (chrome.cast.isAvailable === false) {
        errorCallback(new chrome.cast.Error(chrome.cast.ErrorCode.API_NOT_INITIALIZED), 'The API is not initialized.', {});
        return;
    }

    execute('mediaStop', function (err) {
        if (!err) {
            successCallback && successCallback();
        } else {
            handleError(err, errorCallback);
        }
    });
};

/**
 * Sets the media stream volume. At least one of volumeRequest.level or volumeRequest.muted must be set. Changing the mute state does not affect the volume level, and vice versa.
 * @param {chrome.cast.media.VolumeRequest} volumeRequest   The set volume request. Must not be null.
 * @param {function} successCallback Invoked on success.
 * @param {function} errorCallback   Invoked on error. The possible errors are TIMEOUT, API_NOT_INITIALIZED, INVALID_PARAMETER, CHANNEL_ERROR, SESSION_ERROR, and EXTENSION_MISSING.
 */
chrome.cast.media.Media.prototype.setVolume = function (volumeRequest, successCallback, errorCallback) {
    if (chrome.cast.isAvailable === false) {
        errorCallback(new chrome.cast.Error(chrome.cast.ErrorCode.API_NOT_INITIALIZED), 'The API is not initialized.', {});
        return;
    }

    if (!volumeRequest.volume || (volumeRequest.volume.level == null && volumeRequest.volume.muted === null)) {
        errorCallback(new chrome.cast.Error(chrome.cast.ErrorCode.SESSION_ERROR), 'INVALID_PARAMS', { reason: 'INVALID_PARAMS', type: 'INVALID_REQUEST' });
        return;
    }

    execute('setMediaVolume', volumeRequest.volume.level, volumeRequest.volume.muted, function (err) {
        if (!err) {
            successCallback && successCallback();
        } else {
            handleError(err, errorCallback);
        }
    });
};

/**
 * Determines whether the media player supports the given media command.
 * @param  {chrome.cast.media.MediaCommand} command The command to query. Must not be null.
 * @returns {boolean} True if the player supports the command.
 */
chrome.cast.media.Media.prototype.supportsCommand = function (command) {
    return this.supportsCommands.indexOf(command) > -1;
};

/**
 * Estimates the current playback position.
 * @returns {number} number An estimate of the current playback position in seconds since the start of the media.
 */
chrome.cast.media.Media.prototype.getEstimatedTime = function () {
    if (this.playerState === chrome.cast.media.PlayerState.PLAYING) {
        var elapsed = (Date.now() - this._lastUpdatedTime) / 1000;
        var estimatedTime = this.currentTime + elapsed;

        return estimatedTime;
    } else {
        return this.currentTime;
    }
};

/**
 * Modifies the text tracks style or change the tracks status. If a trackId does not match
 * the existing trackIds the whole request will fail and no status will change.
 * @param {chrome.cast.media.EditTracksInfoRequest}        editTracksInfoRequest Value must not be null.
 * @param {function()}                                                                successCallback Invoked on success.
 * @param {function(not-null chrome.cast.Error)}            errorCallback Invoked on error. The possible errors are TIMEOUT, API_NOT_INITIALIZED, INVALID_PARAMETER, CHANNEL_ERROR, SESSION_ERROR, and EXTENSION_MISSING.
 **/
chrome.cast.media.Media.prototype.editTracksInfo = function (editTracksInfoRequest, successCallback, errorCallback) {
    if (chrome.cast.isAvailable === false) {
        errorCallback(new chrome.cast.Error(chrome.cast.ErrorCode.API_NOT_INITIALIZED), 'The API is not initialized.', {});
        return;
    }

    var activeTracks = editTracksInfoRequest.activeTrackIds;
    var textTrackSytle = editTracksInfoRequest.textTrackSytle;

    execute('mediaEditTracksInfo', activeTracks, textTrackSytle || {}, function (err) {
        if (!err) {
            successCallback && successCallback();
        } else {
            handleError(err, errorCallback);
        }
    });

};

/**
 * Adds a listener that is invoked when the status of the media has changed.
 * Changes to the following properties will trigger the listener: currentTime, volume, metadata, playbackRate, playerState, customData.
 * @param {function} listener The listener to add. The parameter indicates whether the Media object is still alive.
 */
chrome.cast.media.Media.prototype.addUpdateListener = function (listener) {
    this.on('_mediaUpdated', listener);
};

/**
 * Removes a previously added listener for this Media.
 * @param {function} listener The listener to remove.
 */
chrome.cast.media.Media.prototype.removeUpdateListener = function (listener) {
    this.removeListener('_mediaUpdated', listener);
};

chrome.cast.media.Media.prototype._update = function (isAlive, obj) {
    this.currentTime = obj.currentTime || this.currentTime;
    this.idleReason = obj.idleReason || this.idleReason;
    this.sessionId = obj.sessionId || this.sessionId;
    this.mediaSessionId = obj.mediaSessionId || this.mediaSessionId;
    this.playbackRate = obj.playbackRate || this.playbackRate;
    this.playerState = obj.playerState || this.playerState;

    if (obj.media && obj.media.duration) {
        this.media = this.media || {};
        this.media.duration = obj.media.duration || this.media.duration;
        this.media.streamType = obj.media.streamType || this.media.streamType;
    }

    if (obj.volume && obj.volume.level) {
        this.volume = new chrome.cast.Volume(obj.volume.level, obj.volume.muted);
    }

    this._lastUpdatedTime = Date.now();

    this.emit('_mediaUpdated', isAlive);
};

/**
 * This contains function exclusive the cordova plugin
 * and equivalents are not available in the chromecast
 * desktop SDK.  Use with caution if you also want your
 * site to work with chrome on desktop.
 */
chrome.cast.cordova = {

    /**
     * Will actively scan for routes and send the complete list of
     * active routes whenever a route change is detected.
     * It is super important that client calls "stopScan", otherwise the
     * battery could drain quickly.
     * @param {function(routes)} successCallback
     * @param {function(chrome.cast.Error)} successCallback
     */
    startRouteScan: function (successCallback, errorCallback) {
        execute('startRouteScan', function (err, routes) {
            if (!err) {
                for (var i = 0; i < routes.length; i++) {
                    var route = routes[i];
                    routes[i] = new chrome.cast.cordova.Route(route.id, route.name, route.isNearbyDevice);
                }
                successCallback(routes);
            } else {
                handleError(err, errorCallback);
            }
        });
    },
    /**
     * Stops any active scanForRoutes.
     * @param {function(routes)} successCallback
     * @param {function(chrome.cast.Error)} successCallback
     */
    stopRouteScan: function (successCallback, errorCallback) {
        execute('stopRouteScan', function (err) {
            if (!err) {
                successCallback();
            } else {
                handleError(err, errorCallback);
            }
        });
    },
    /**
     * Attempts to join the requested route
     * @param {chrome.cast.cordova.Route} route
     * @param {function(routes)} successCallback
     * @param {function(chrome.cast.Error)} successCallback
     */
    selectRoute: function (route, successCallback, errorCallback) {
        execute('selectRoute', route.id, function (err, session) {
            if (!err) {
                successCallback(updateSession(session));
            } else {
                handleError(err, errorCallback);
            }
        });
    },
    Route: function (id, name, isNearbyDevice) {
        this.id = id;
        this.name = name;
        this.isNearbyDevice = isNearbyDevice;
    }
};

var _connectingListeners = [];

chrome.cast.addConnectingListener = function (cb) {
    _connectingListeners.push(cb);
};

chrome.cast.removeConnectingListener = function (cb) {
    if (_connectingListeners.indexOf(cb) > -1) {
        _connectingListeners.splice(_connectingListeners.indexOf(cb), 1);
    }
};

/** ************* Cordova Events ********************/
// TODO
/**
 * These are events that are triggered from the plugin using "sendJavascript"
 * It is recommended by cordova that we avoid sendJavascript usage
 * so we should try to remove all of these functions eventually.
 */

chrome.cast._emitConnecting = function () {
    for (var n = 0; n < _connectingListeners.length; n++) {
        _connectingListeners[n]();
    }
};

chrome.cast._ = {
    /**
     * @param {boolean} available
     */
    receiverUpdate: function (available) {
        if (available) {
            _receiverListener(chrome.cast.ReceiverAvailability.AVAILABLE);
        } else {
            _receiverListener(chrome.cast.ReceiverAvailability.UNAVAILABLE);
        }
    },
    /**
     * Function called from cordova when the Session has changed.
     * Changes to the following properties will trigger the listener:
     *     statusText, namespaces, status, and the volume of the receiver.
     *
     * Listeners should check the status property of the Session to
     * determine its connection status. The boolean parameter isAlive is
     * deprecated in favor of the status Session property. The isAlive
     * parameter is still passed in for backwards compatibility, and is
     * true unless status = chrome.cast.SessionStatus.STOPPED.
     * @param {function} listener The listener to add.
     */
    sessionUpdated: function (obj) {
        if (_session) {
            _session._update(obj);
        }
    },
    mediaUpdated: function (isAlive, media) {
        if (_currentMedia) {
            _currentMedia._update(isAlive, media);
        } else {
            _currentMedia = new chrome.cast.media.Media(media.sessionId, media.mediaSessionId);
            _currentMedia.currentTime = media.currentTime;
            _currentMedia.playerState = media.playerState;
            _currentMedia.media = media.media;

            _session.media[0] = _currentMedia;
        }
    },
    mediaLoaded: function (media) {
        if (_session) {
            if (!_currentMedia) {
                _currentMedia = new chrome.cast.media.Media(media.sessionId, media.mediaSessionId);
            }
            _currentMedia._update(true, media);
            _session.emit('_mediaListener', _currentMedia);
        }
    },
    sessionListener: function (javaSession) {
        var session = updateSession(javaSession);
        _sessionListener(session);
    },
    sessionJoined: function (obj) {
        var session = updateSession(obj);

        if (obj.media && obj.media.sessionId) {
            _currentMedia = new chrome.cast.media.Media(session.sessionId, obj.media.mediaSessionId);
            _currentMedia.currentTime = obj.media.currentTime;
            _currentMedia.playerState = obj.media.playerState;
            _currentMedia.media = obj.media.media;
            session.media[0] = _currentMedia;
        }

        _sessionListener(session);
    },
    onMessage: function (namespace, message) {
        if (_session) {
            _session.emit('message:' + namespace, namespace, message);
        }
    }
};

module.exports = chrome.cast;

/**
 * Updates the current session with the incoming javaSession
 */
function updateSession (javaSession) {
    // Should we reset the sesion?
    if (!javaSession) {
        _session = undefined;
        _sessionListener = function () {};
        _receiverListener = function () {};
        return;
    }
    _session = new chrome.cast.Session(
        javaSession.sessionId,
        javaSession.appId,
        javaSession.displayName,
        javaSession.appImages || [],
        createReceiver(javaSession.receiver)
        );
    _session.status = chrome.cast.SessionStatus.CONNECTED;
    _session.media[0] = createMedia(javaSession.media, javaSession.sessionId);

    return _session;
}

function createMedia (media, sessionId) {
    if (media && media.sessionId) {
        _currentMedia = new chrome.cast.media.Media(sessionId, media.mediaSessionId);
        _currentMedia.currentTime = media.currentTime;
        _currentMedia.playerState = media.playerState;
        _currentMedia.media = media.media;
    }
    return _currentMedia;
}

function createReceiver (receiver) {
    if (!receiver) {
        return new chrome.cast.Receiver(null, null, null, null);
    }
    var outReceiver = new chrome.cast.Receiver(
        receiver.label,
        receiver.friendlyName,
        receiver.capabilities || [],
        null
    );
    if (receiver.volume) {
        outReceiver.volume = new chrome.cast.Volume(receiver.volume.level, receiver.volume.muted);
    }
    return outReceiver;
}

function execute (action) {
    var args = [].slice.call(arguments);
    args.shift();
    var callback;
    if (args[args.length - 1] instanceof Function) {
        callback = args.pop();
    }
    window.cordova.exec(function (result) { callback && callback(null, result); }, function (err) { callback && callback(err); }, 'Chromecast', action, args);
}

function handleError (err, callback) {
    var errorDescription = err;

    err = err.toLowerCase() || '';
    if (err === chrome.cast.ErrorCode.TIMEOUT) {
        errorDescription = 'The operation timed out.';
    } else if (err === chrome.cast.ErrorCode.INVALID_PARAMETER) {
        errorDescription = 'The parameters to the operation were not valid.';
    } else if (err === chrome.cast.ErrorCode.RECEIVER_UNAVAILABLE) {
        errorDescription = 'No receiver was compatible with the session request.';
    } else if (err === chrome.cast.ErrorCode.CANCEL) {
        errorDescription = 'The operation was canceled by the user.';
    } else if (err === chrome.cast.ErrorCode.CHANNEL_ERROR) {
        errorDescription = 'A channel to the receiver is not available.';
    } else if (err === chrome.cast.ErrorCode.SESSION_ERROR) {
        errorDescription = 'A session could not be created, or a session was invalid.';
    } else {
        errorDescription = err;
        err = chrome.cast.ErrorCode.UNKNOWN;
    }

    var error = new chrome.cast.Error(err, errorDescription, {});
    if (callback) {
        callback(error);
    }
}

execute('setup', function (err) {
    if (!err) {
        chrome.cast.isAvailable = true;
    } else {
        throw new Error('Unable to setup chrome.cast API' + err);
    }
});