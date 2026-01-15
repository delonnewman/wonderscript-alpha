; -*- mode: clojure -*-

1
"This is a string"
[1 2 3]
[1, 2, 3]
'(1 2 3)
{:a 1, :b 2}

;; slot access
(is (nil? (slot-get js/global 'hey)))
(slot-set! js/global 'hey "You!")
(is (= "You!" (slot-get js/global 'hey)))

(def version (slot-get js/process "version"))
(is (not (nil? version)))
(is (= version (slot-get js/process 'version)))
(is (= version (slot-get js/process :version)))
(is (= version (slot-get js/process 'version)))
